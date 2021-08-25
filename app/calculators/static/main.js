function compound_interest(wealth, rate, contrib, years) {
  wealth = (wealth + contrib) * (1 + rate);
  if (years == 1) {
    return wealth;
  }
  return compound_interest(wealth, rate, contrib, years - 1);
}

document
  .getElementById("compound-calc")
  .addEventListener("change", function () {
    let wealth = parseFloat(this.querySelector("#start").value);
    let rate = this.querySelector("#rate").value / 100;
    let contrib = parseFloat(this.querySelector("#contrib").value);
    let years = parseInt(this.querySelector("#years").value);

    let finalValue = compound_interest(wealth, rate, contrib, years).toFixed(2);
    this.querySelector("#output").value = finalValue;
  });

function fireTarget(wr, retirementSpending, tax) {
  let withdrawal = retirementSpending / (1 - tax);
  document.querySelector("#fire-calc #withdrawal").value =
    withdrawal.toFixed(2);

  let target = withdrawal / wr - withdrawal;
  return target;
}

function fireAge(
  target,
  age,
  start,
  income,
  spending,
  rate,
  growth,
  incomeCap
) {
  let wealth = start;
  while (true) {
    wealth = (wealth + income - spending) * (1 + rate);

    if (wealth >= target) {
      return age;
    }

    age += 1;
    income *= 1 + growth;
    if (income > incomeCap && incomeCap > 0) {
      income = incomeCap;
    }
    if (age >= 200) {
      return;
    }
  }
}

function fireSafety(wealth, rate, withdrawal) {
  return (wealth - withdrawal) * (1 + rate) > wealth || wealth == 0;
}

function updateAnnualSaving(income, spending) {
  document.querySelector("#fire-calc #saving").value = (
    income - spending
  ).toFixed(2);
}

function updateRetirementSpending(spending) {
  let retirementSpending = document.querySelector("#fire-calc #r_spending");
  if (retirementSpending.value == 0) {
    retirementSpending.value = spending.toFixed(2);
  }
  return parseFloat(retirementSpending.value);
}

document.getElementById("fire-calc").addEventListener("change", function () {
  let age = parseInt(this.querySelector("#age").value);
  let start = parseFloat(this.querySelector("#start").value);
  let income = parseFloat(this.querySelector("#income").value);
  let spending = parseFloat(this.querySelector("#spending").value);
  let rate = this.querySelector("#rate").value / 100;
  let growth = this.querySelector("#growth").value / 100;
  let incomeCap = parseFloat(this.querySelector("#income-cap").value);
  let retirementSpending = updateRetirementSpending(spending);
  let wr = this.querySelector("#wr").value / 100;
  let tax = this.querySelector("#tax").value / 100;

  updateAnnualSaving(income, spending);

  let target = fireTarget(wr, retirementSpending, tax);

  this.querySelector("#fire-target").value = target.toFixed(2);
  this.querySelector("#fire-age").value = fireAge(
    target,
    age,
    start,
    income,
    spending,
    rate,
    growth,
    incomeCap
  );

  let withdrawal = parseFloat(this.querySelector("#withdrawal").value);
  if (fireSafety(target, rate, withdrawal)) {
    this.querySelector("#wr").classList.remove("unsafe");
  } else {
    this.querySelector("#wr").classList.add("unsafe");
  }
});
