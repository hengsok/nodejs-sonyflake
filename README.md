# nodejs-sonyflake

This has the flavour of Sonyflake by making some changes to the great work from utkarsh-pro on nodejs-snowflake.

# Sonyflake

39 bits for time in units of 10 msec
 8 bits for a sequence number
16 bits for a machine id

Difference between Sonyflake and Snowflake is in the number of bits assigned for each components and also in Sonyflake, 'sequence number' is placed before 'machine id'.
Apart from this, usage of this package is the same as nodejs-snowflake as below.

### NOTE
The ID generator produces ids faster if the return type is bigint, but this option is disabled by default. Do the following to enable this feature.

```javascript

const { UniqueID } = require('nodejs-sonyflake');

const uid = new UniqueID({
    returnNumber: false,
    machineID: 1,
    customEpoch: 1622505600000
}); 

const ID = uid.getUniqueID(); // This id is in string
uid.asyncGetUniqueID().then(id => console.log(id)); // Promisified version of the above method

```

### Get timestamp from the ID
Get the timestamp of creation of the ID can be extracted by using this method. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

uid.getTimestampFromID(id); // Here id can be either as as string or as a bigint

```

### Get machine id from the ID
Get the machine id of the machine on which the token was generated. This method will work even if this instance or machine wasn't actually used to generate this id.

```javascript
...

const mid = uid.getMachineIDFromID(id); // Here id can be either as as string or as a bigint

console.log(mid); // 2345 -> This is the 12 bit long machine id where this token was generated

```

### Get ID corresponding to a Timestamp
This can be extremely helpful in writing database queries where the requirement could be to get entries created after a certain timestamp.

```javascript
...

const id = uid.IDFromTimestamp(Date.now()); // Here id will always be BigInt

console.log(id); // A 64 bit id is returned corresponding to the timestamp given

```

### Get the current machine id
This solely exits to find the machine id of current machine in case the user didn't provided as machine id and relied on the randomly generated value.

```javascript
...

uid.machineID; // The machine id of the current machine, set either by user or randomly generated

```
