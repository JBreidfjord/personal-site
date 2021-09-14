document.getElementById("image-submit").onclick = function () {
  let image = document.getElementById("image-upload").files[0];

  // Handle image compression
  const blobURL = window.URL.createObjectURL(image);
  const img = new Image();
  img.src = blobURL;
  img.onload = function () {
    URL.revokeObjectURL(this.src);
    const [newWidth, newHeight] = calculateSize(img);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    canvas.toBlob((blob) => {
      // Send image to server
      let formData = new FormData();
      formData.append("file", blob);
      fetch("/supercow", { method: "POST", body: formData })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid response");
          }
          return response.json();
        })
        // Server returns image classification
        .then((response) => {
          let data = JSON.parse(response);
          let className = data["class_name"];
          document.getElementById("class-desc").innerText = className;

          // Update image display
          let img = document.getElementById("image-display");
          if (!img) {
            let classDesc = document.getElementById("class-desc");
            let img = new Image();
            img.id = "image-display";
            let blobURL = window.URL.createObjectURL(image);
            img.src = blobURL;
            img.style.maxWidth = "50%";
            classDesc.parentNode.insertBefore(img, classDesc);
          } else {
            let newImg = new Image();
            newImg.id = img.id;
            let blobURL = window.URL.createObjectURL(image);
            newImg.src = blobURL;
            newImg.style.maxWidth = "50%";
            img.parentNode.insertBefore(newImg, img);
            img.parentNode.removeChild(img);
          }
        })
        .catch((error) => {
          console.error("Invalid image", error);
        });
    });
  };
};

function calculateSize(img) {
  const maxWidth = 448;
  const maxHeight = 448;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}
