/* cppsrc/main.cpp */

#include <napi.h>
#include <cstdint>
#include <string>
#include <cmath>
#include <functional>
#include <chrono>
#include <thread>

// ////////////////////////////////////////////////////////////////////////////////////////

/**
 * Total number of bits allocated to an ID
*/
constexpr int TOTAL_BITS = 64;

/**
 * Total number of bits allocated to an epoch timestamp
*/
//cs - sonyflake uses 39 but since we use bigint here which is 64bits, we need to set EPOCH_BITS to use 40 bits
constexpr int EPOCH_BITS = 40;

/**
 * Total number of bits allocated to an node/machine id
*/
constexpr int NODE_ID_BITS = 16;

/**
 * Total number of bits allocated to an sequencing
*/
constexpr int SEQUENCE_BITS = 8;

/** 
 * Max node that can be used
*/
constexpr uint64_t maxNodeId = (1 << NODE_ID_BITS) - 1;

constexpr uint64_t maxSequence = (1 << SEQUENCE_BITS) - 1;

// ////////////////////////////////////////////////////////////////////////////////////////

uint64_t getCurrentTime()
{
    return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

// ////////////////////////////////////////////////////////////////////////////////////////

class Snowflake : public Napi::ObjectWrap<Snowflake>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Snowflake(const Napi::CallbackInfo &info);

private:
    static Napi::FunctionReference constructor;
    uint64_t _lastTimestamp;
    uint64_t _CUSTOM_EPOCH = 1546300800000;
    uint16_t _sequence;
    uint16_t _nodeID;
    Napi::Value getUniqueIDBigInt(const Napi::CallbackInfo &info);
    Napi::Value getTimestampFromID(const Napi::CallbackInfo &info);
    Napi::Value getNodeIDFomID(const Napi::CallbackInfo &info);
    Napi::Value getIDFromTimestamp(const Napi::CallbackInfo &info);
};

Napi::Object Snowflake::Init(Napi::Env env, Napi::Object exports)
{
    // This method is used to hook the accessor and method callbacks
    auto func = DefineClass(
        env,
        "Snowflake",
        {
            InstanceMethod("getUniqueID", &Snowflake::getUniqueIDBigInt),
            InstanceMethod("getTimestampFromID", &Snowflake::getTimestampFromID),
            InstanceMethod("getNodeIDFromID", &Snowflake::getNodeIDFomID),
            InstanceMethod("getIDFromTimestamp", &Snowflake::getIDFromTimestamp),
        });

    // Create a peristent reference to the class constructor. This will allow
    // a function called on a class prototype and a function
    // called on instance of a class to be distinguished from each other.
    constructor = Napi::Persistent(func);
    // Call the SuppressDestruct() method on the static data prevent the calling
    // to this destructor to reset the reference when the environment is no longer
    // available.
    constructor.SuppressDestruct();
    exports.Set("Snowflake", func);
    return exports;
}

Snowflake::Snowflake(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Snowflake>(info)
{
    auto argLen = info.Length();
    if (argLen != 2)
        Napi::TypeError::New(info.Env(), "Expected two arguments.").ThrowAsJavaScriptException();

    this->_CUSTOM_EPOCH = info[0].As<Napi::Number>().Int64Value();
    // If the number is bigger than maxNodeId than those bits will be fall off
    this->_nodeID = info[1].As<Napi::Number>().Int32Value() & maxNodeId;

    this->_lastTimestamp = 0;
    this->_sequence = 0;
}

Napi::FunctionReference Snowflake::constructor;

/**
 * Takes the current timestamp, last timestamp, sequence, and macID
 * and generates a 64 bit long integer by performing bitwise operations
 * 
 * First 41 bits are filled with current timestamp
 * Next 10 bits are filled with the node/machine id (max size can be 4096)
 * Next 12 bits are filled with sequence which ensures that even if timestamp didn't change the value will be generated
 * 
 * Function can theorotically generate 1024 unique values within a millisecond without repeating values
*/
Napi::Value Snowflake::getUniqueIDBigInt(const Napi::CallbackInfo &info)
{
    auto env = info.Env();

    uint64_t currentTimestamp = getCurrentTime() - this->_CUSTOM_EPOCH;

    if (currentTimestamp == this->_lastTimestamp)
    {
        this->_sequence = (this->_sequence + 1) & maxSequence;
        if (!this->_sequence)
        {
            std::this_thread::sleep_for(std::chrono::milliseconds(1));
            ++currentTimestamp;
        }
    }
    else
    {
        this->_sequence = 0;
    }

    this->_lastTimestamp = currentTimestamp;

    uint64_t id{};
    id = currentTimestamp << (TOTAL_BITS - EPOCH_BITS);
    id |= (this->_sequence << (TOTAL_BITS - EPOCH_BITS - SEQUENCE_BITS));
    id |= this->_nodeID;

    return Napi::BigInt::New(env, id);
}

/**
 * Returns timestamp at which the id was generated by retreiving
 * the first 41 bits of the id, which are filled with current timestamp
 * bits
*/
Napi::Value Snowflake::getTimestampFromID(const Napi::CallbackInfo &info)
{
    auto env = info.Env();
    uint64_t uniqueID{};

    if (info[0].IsString())
    {
        auto first = info[0].As<Napi::String>();

        uniqueID = std::stoull(first.Utf8Value());
    }
    else if (info[0].IsBigInt())
    {
        bool lossless = true;
        uniqueID = info[0].As<Napi::BigInt>().Int64Value(&lossless);
    }
    else
    {
        Napi::TypeError::New(env, "BigInt or string expected").ThrowAsJavaScriptException();
    }

    uint64_t timestamp = uniqueID >> (TOTAL_BITS - EPOCH_BITS);

    return Napi::Number::New(env, timestamp + _CUSTOM_EPOCH);
}

/**
 * Returns NodeID/Machine ID at which the id was generated
*/
Napi::Value Snowflake::getNodeIDFomID(const Napi::CallbackInfo &info)
{
    auto env = info.Env();
    uint64_t uniqueID = 0;

    if (info[0].IsString())
    {
        auto first = info[0].As<Napi::String>();

        uniqueID = std::stoull(first.Utf8Value());
    }
    else if (info[0].IsBigInt())
    {
        bool lossless = true;
        uniqueID = info[0].As<Napi::BigInt>().Int64Value(&lossless);
    }
    else
    {
        Napi::TypeError::New(env, "BigInt or string expected").ThrowAsJavaScriptException();
    }

    int BITS = TOTAL_BITS - NODE_ID_BITS - SEQUENCE_BITS;
    uint16_t machineID = (uniqueID << BITS) >> (BITS + SEQUENCE_BITS);

    return Napi::Number::New(env, machineID);
}

/**
 * getIDFromTimestamp takes in a timestamp and will produce
 * id corresponding to that timestamp. It will generate ID with
 * sequence number 0.
 * 
 * This method can be useful in writing SQL queries 
 * where you want results which were created after
 * a certain timestamp
*/
Napi::Value Snowflake::getIDFromTimestamp(const Napi::CallbackInfo &info)
{
    auto env = info.Env();
    uint64_t timestamp = 0;

    if (info[0].IsString())
    {
        auto first = info[0].As<Napi::String>();
        timestamp = std::stoull(first.Utf8Value());
    }
    else if (info[0].IsNumber())
    {
        timestamp = info[0].As<Napi::Number>().Int64Value();
    }

    uint64_t currentTimestamp = timestamp - this->_CUSTOM_EPOCH;

    uint64_t id{};
    id = currentTimestamp << (TOTAL_BITS - EPOCH_BITS);
    id |= (this->_nodeID << (TOTAL_BITS - EPOCH_BITS - NODE_ID_BITS));

    return Napi::BigInt::New(env, id);
}

// ////////////////////////////////////////////////////////////////////////////////////////

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    Snowflake::Init(env, exports);
    return exports;
}

NODE_API_MODULE(snowflake, InitAll)