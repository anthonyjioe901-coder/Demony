// High-performance financial calculations
// These functions are called from the Node.js native addon

#ifndef CALCULATIONS_H
#define CALCULATIONS_H

#include <vector>
#include <cmath>

namespace Calculations {

// Calculate compound interest: P * (1 + r)^t
double compoundInterest(double principal, double rate, double time);

// Calculate Net Present Value
double calculateNPV(double rate, const std::vector<double>& cashFlows);

// Calculate Internal Rate of Return using Newton-Raphson method
double calculateIRR(const std::vector<double>& cashFlows, double guess = 0.1);

// Calculate portfolio risk (standard deviation of returns)
double portfolioRisk(const std::vector<double>& returns);

// Calculate Sharpe Ratio
double sharpeRatio(const std::vector<double>& returns, double riskFreeRate);

// Calculate mean of a vector
double mean(const std::vector<double>& values);

// Calculate standard deviation
double standardDeviation(const std::vector<double>& values);

}

#endif // CALCULATIONS_H
