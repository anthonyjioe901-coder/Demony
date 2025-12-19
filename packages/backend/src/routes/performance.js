// Performance routes - uses C++ native addon for calculations
var express = require('express');
var router = express.Router();

// Try to load native addon
var nativeAddon = null;
try {
  nativeAddon = require('../../build/Release/demony_native.node');
} catch (err) {
  console.log('Performance routes: C++ addon not available, using JS fallback');
}

// JavaScript fallback functions
var jsFallback = {
  calculateCompoundInterest: function(principal, rate, time) {
    return principal * Math.pow(1 + rate, time);
  },
  
  calculateNPV: function(rate, cashFlows) {
    var npv = 0;
    for (var i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i);
    }
    return npv;
  },
  
  calculatePortfolioRisk: function(returns) {
    if (returns.length < 2) return 0;
    var mean = returns.reduce(function(a, b) { return a + b; }, 0) / returns.length;
    var sumSquares = returns.reduce(function(acc, val) {
      return acc + Math.pow(val - mean, 2);
    }, 0);
    return Math.sqrt(sumSquares / (returns.length - 1));
  }
};

// Get calculator instance
function getCalculator() {
  return nativeAddon || jsFallback;
}

// Calculate projected returns
router.post('/returns', function(req, res) {
  var principal = req.body.principal;
  var rate = req.body.rate;
  var years = req.body.years;
  
  if (!principal || !rate || !years) {
    return res.status(400).json({ error: 'Principal, rate, and years are required' });
  }
  
  var calc = getCalculator();
  var futureValue = calc.calculateCompoundInterest(principal, rate, years);
  
  res.json({
    principal: principal,
    rate: rate,
    years: years,
    futureValue: futureValue,
    totalReturn: futureValue - principal,
    usingNativeAddon: nativeAddon !== null
  });
});

// Calculate investment NPV
router.post('/npv', function(req, res) {
  var rate = req.body.rate;
  var cashFlows = req.body.cashFlows;
  
  if (!rate || !cashFlows || !Array.isArray(cashFlows)) {
    return res.status(400).json({ error: 'Rate and cash flows array are required' });
  }
  
  var calc = getCalculator();
  var npv = calc.calculateNPV(rate, cashFlows);
  
  res.json({
    rate: rate,
    cashFlows: cashFlows,
    npv: npv,
    usingNativeAddon: nativeAddon !== null
  });
});

// Calculate portfolio risk
router.post('/risk', function(req, res) {
  var returns = req.body.returns;
  
  if (!returns || !Array.isArray(returns)) {
    return res.status(400).json({ error: 'Returns array is required' });
  }
  
  var calc = getCalculator();
  var risk = calc.calculatePortfolioRisk(returns);
  
  res.json({
    returns: returns,
    risk: risk,
    riskLevel: risk < 0.1 ? 'Low' : risk < 0.2 ? 'Moderate' : 'High',
    usingNativeAddon: nativeAddon !== null
  });
});

module.exports = router;
