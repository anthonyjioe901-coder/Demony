// C++ Native Addon Entry Point
// Provides high-performance financial calculations

#include <napi.h>
#include "calculations.h"

// Calculate compound interest
// Principal * (1 + rate)^time
Napi::Value CalculateCompoundInterest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3 arguments: principal, rate, time")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    double principal = info[0].As<Napi::Number>().DoubleValue();
    double rate = info[1].As<Napi::Number>().DoubleValue();
    double time = info[2].As<Napi::Number>().DoubleValue();

    double result = Calculations::compoundInterest(principal, rate, time);
    return Napi::Number::New(env, result);
}

// Calculate internal rate of return (IRR)
Napi::Value CalculateIRR(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of cash flows")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array cashFlowsArray = info[0].As<Napi::Array>();
    std::vector<double> cashFlows;

    for (uint32_t i = 0; i < cashFlowsArray.Length(); i++) {
        cashFlows.push_back(cashFlowsArray.Get(i).As<Napi::Number>().DoubleValue());
    }

    double result = Calculations::calculateIRR(cashFlows);
    return Napi::Number::New(env, result);
}

// Calculate net present value (NPV)
Napi::Value CalculateNPV(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected 2 arguments: rate, cash flows array")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    double rate = info[0].As<Napi::Number>().DoubleValue();
    Napi::Array cashFlowsArray = info[1].As<Napi::Array>();
    std::vector<double> cashFlows;

    for (uint32_t i = 0; i < cashFlowsArray.Length(); i++) {
        cashFlows.push_back(cashFlowsArray.Get(i).As<Napi::Number>().DoubleValue());
    }

    double result = Calculations::calculateNPV(rate, cashFlows);
    return Napi::Number::New(env, result);
}

// Calculate portfolio risk (standard deviation)
Napi::Value CalculatePortfolioRisk(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of returns")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array returnsArray = info[0].As<Napi::Array>();
    std::vector<double> returns;

    for (uint32_t i = 0; i < returnsArray.Length(); i++) {
        returns.push_back(returnsArray.Get(i).As<Napi::Number>().DoubleValue());
    }

    double result = Calculations::portfolioRisk(returns);
    return Napi::Number::New(env, result);
}

// Calculate Sharpe ratio
Napi::Value CalculateSharpeRatio(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected 2 arguments: returns array, risk-free rate")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array returnsArray = info[0].As<Napi::Array>();
    double riskFreeRate = info[1].As<Napi::Number>().DoubleValue();
    std::vector<double> returns;

    for (uint32_t i = 0; i < returnsArray.Length(); i++) {
        returns.push_back(returnsArray.Get(i).As<Napi::Number>().DoubleValue());
    }

    double result = Calculations::sharpeRatio(returns, riskFreeRate);
    return Napi::Number::New(env, result);
}

// Initialize the native addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "calculateCompoundInterest"),
                Napi::Function::New(env, CalculateCompoundInterest));
    exports.Set(Napi::String::New(env, "calculateIRR"),
                Napi::Function::New(env, CalculateIRR));
    exports.Set(Napi::String::New(env, "calculateNPV"),
                Napi::Function::New(env, CalculateNPV));
    exports.Set(Napi::String::New(env, "calculatePortfolioRisk"),
                Napi::Function::New(env, CalculatePortfolioRisk));
    exports.Set(Napi::String::New(env, "calculateSharpeRatio"),
                Napi::Function::New(env, CalculateSharpeRatio));
    return exports;
}

NODE_API_MODULE(demony_native, Init)
