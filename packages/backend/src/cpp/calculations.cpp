// High-performance financial calculations implementation

#include "calculations.h"
#include <cmath>
#include <algorithm>
#include <numeric>

namespace Calculations {

// Calculate compound interest: P * (1 + r)^t
double compoundInterest(double principal, double rate, double time) {
    return principal * std::pow(1.0 + rate, time);
}

// Calculate mean of a vector
double mean(const std::vector<double>& values) {
    if (values.empty()) return 0.0;
    double sum = std::accumulate(values.begin(), values.end(), 0.0);
    return sum / values.size();
}

// Calculate standard deviation
double standardDeviation(const std::vector<double>& values) {
    if (values.size() < 2) return 0.0;
    
    double m = mean(values);
    double sumSquares = 0.0;
    
    for (size_t i = 0; i < values.size(); i++) {
        double diff = values[i] - m;
        sumSquares += diff * diff;
    }
    
    return std::sqrt(sumSquares / (values.size() - 1));
}

// Calculate Net Present Value
double calculateNPV(double rate, const std::vector<double>& cashFlows) {
    double npv = 0.0;
    
    for (size_t i = 0; i < cashFlows.size(); i++) {
        npv += cashFlows[i] / std::pow(1.0 + rate, static_cast<double>(i));
    }
    
    return npv;
}

// Calculate Internal Rate of Return using Newton-Raphson method
double calculateIRR(const std::vector<double>& cashFlows, double guess) {
    const int MAX_ITERATIONS = 100;
    const double TOLERANCE = 1e-7;
    
    double rate = guess;
    
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        double npv = 0.0;
        double derivativeNPV = 0.0;
        
        for (size_t j = 0; j < cashFlows.size(); j++) {
            double t = static_cast<double>(j);
            double factor = std::pow(1.0 + rate, t);
            npv += cashFlows[j] / factor;
            
            if (j > 0) {
                derivativeNPV -= t * cashFlows[j] / (factor * (1.0 + rate));
            }
        }
        
        if (std::abs(npv) < TOLERANCE) {
            return rate;
        }
        
        if (std::abs(derivativeNPV) < TOLERANCE) {
            break; // Derivative too small, can't continue
        }
        
        rate = rate - npv / derivativeNPV;
    }
    
    return rate;
}

// Calculate portfolio risk (standard deviation of returns)
double portfolioRisk(const std::vector<double>& returns) {
    return standardDeviation(returns);
}

// Calculate Sharpe Ratio: (mean return - risk free rate) / standard deviation
double sharpeRatio(const std::vector<double>& returns, double riskFreeRate) {
    if (returns.empty()) return 0.0;
    
    double avgReturn = mean(returns);
    double stdDev = standardDeviation(returns);
    
    if (stdDev == 0.0) return 0.0;
    
    return (avgReturn - riskFreeRate) / stdDev;
}

} // namespace Calculations
