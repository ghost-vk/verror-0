# verror: rich JavaScript errors

## Differences from the original verror

**Switched from CommonJS to ESM+CommonJS**

The library now uses ECMAScript Modules or CommonJS instead of CommonJS to leverage modern module features in Node.js.

**`node:util.format` instead of `extsprintf`**

Replaced the external `extsprintf` dependency with the built-in format method from `node:util`, reducing the number of external dependencies.

**Use of Node.js standard library instead of external dependencies**

External dependencies were removed in favor of functions provided by the Node.js standard library.

**Using `node:test` runner**

Tests are now implemented using the built-in node:test runner instead of external test frameworks.

**Built-in TypeScript typings**

Type definitions are included within the package, eliminating the need for separate type files or additional type installations.

**Modern error inheritance**

Instead of using the deprecated `util.inherit`, the library now uses standard class inheritance (class extends Error).

**Update methods**

- Added link to function `hasCause` from static method `hasCauseWithName`.
- Added link to function `findCause` from static method `findCauseByName`.
- Added link to function `cause` from static method `cause`.
- Added link to function `info` from static method `info`.
- Added link to function `stack` from static method `fullStack`.
- Moved static method `errorFromList` to function `fromList`.
- Moved static method `errorForEach` to function `errorForEach`.

**Added `wrap` function**

The wrap function wraps an unknown value into an Error (or VError), making it easier to handle unknown types of errors in TypeScript.

These changes make the library more modern and TypeScript-friendly, with fewer dependencies and an improved code structure.

```ts
async function handleSomething() {
  try {
    // It throws an error.
    await query();
  } catch (err) {
    // TypeScript doesn't complain that the error is unknown type.
    throw new VError(wrap(err), 'error handle something');
  }
}
```

---

## Overview

This module provides several classes in support of Joyent's [Best Practices for
Error Handling in Node.js](http://www.joyent.com/developers/node/design/errors).
If you find any of the behavior here confusing or surprising, check out that
document first.

The error classes here support:

- printf-style arguments for the message
- chains of causes
- properties to provide extra information about the error
- creating your own subclasses that support all of these

The classes here are:

- **VError**, for chaining errors while preserving each one's error message.
  This is useful in servers and command-line utilities when you want to
  propagate an error up a call stack, but allow various levels to add their own
  context. See examples below.
- **WError**, for wrapping errors while hiding the lower-level messages from the
  top-level error. This is useful for API endpoints where you don't want to
  expose internal error messages, but you still want to preserve the error chain
  for logging and debugging.
- **SError**, which is just like VError but interprets printf-style arguments
  more strictly.
- **MultiError**, which is just an Error that encapsulates one or more other
  errors. (This is used for parallel operations that return several errors.)

# Quick start

First, install the package:

```
npm install verror-0
```

If nothing else, you can use VError as a drop-in replacement for the built-in
JavaScript Error class, with the addition of printf-style messages:

```ts
const err = new VError('missing file: "%s"', '/etc/passwd');
console.log(err.message); // missing file: "/etc/passwd"
```

You can also pass a `cause` argument, which is any other Error object:

```ts
import fs from 'fs';

const filename = '/nonexistent';
fs.stat(filename, function (err1) {
  const err2 = new VError(err1, 'stat "%s"', filename);
  // stat "/nonexistent": ENOENT, stat '/nonexistent'
  console.error(err2.message);
});
```

which resembles how Unix programs typically report errors:

```
$ sort /nonexistent
sort: open failed: /nonexistent: No such file or directory
```

To match the Unixy feel, when you print out the error, just prepend the
program's name to the VError's `message`. Or just call
[node-cmdutil.fail(your_verror)](https://github.com/joyent/node-cmdutil), which
does this for you.

You can get the next-level Error using `err.cause()`:

```ts
// ENOENT, stat '/nonexistent'
console.error(err2.cause().message);
```

Of course, you can chain these as many times as you want, and it works with any
kind of Error:

```ts
const err1 = new Error('No such file or directory');
const err2 = new VError(err1, 'failed to stat "%s"', '/junk');
const err3 = new VError(err2, 'request failed');
// request failed: failed to stat "/junk": No such file or directory
console.error(err3.message);
```

The idea is that each layer in the stack annotates the error with a description
of what it was doing. The end result is a message that explains what happened
at each level.

You can also decorate Error objects with additional information so that callers
can not only handle each kind of error differently, but also construct their own
error messages (e.g., to localize them, format them, group them by type, and so
on). See the example below.

# Deeper dive

The two main goals for VError are:

- **Make it easy to construct clear, complete error messages intended for
  people.** Clear error messages greatly improve both user experience and
  debuggability, so we wanted to make it easy to build them. That's why the
  constructor takes printf-style arguments.
- **Make it easy to construct objects with programmatically-accessible
  metadata** (which we call _informational properties_). Instead of just saying
  "connection refused while connecting to 192.168.1.2:80", you can add
  properties like `"ip": "192.168.1.2"` and `"tcpPort": 80`. This can be used
  for feeding into monitoring systems, analyzing large numbers of Errors (as
  from a log file), or localizing error messages.

To really make this useful, it also needs to be easy to compose Errors:
higher-level code should be able to augment the Errors reported by lower-level
code to provide a more complete description of what happened. Instead of saying
"connection refused", you can say "operation X failed: connection refused".
That's why VError supports `causes`.

In order for all this to work, programmers need to know that it's generally safe
to wrap lower-level Errors with higher-level ones. If you have existing code
that handles Errors produced by a library, you should be able to wrap those
Errors with a VError to add information without breaking the error handling
code. There are two obvious ways that this could break such consumers:

- The error's name might change. People typically use `name` to determine what
  kind of Error they've got. To ensure compatibility, you can create VErrors
  with custom names, but this approach isn't great because it prevents you from
  representing complex failures. For this reason, VError provides
  `findCause`, which essentially asks: does this Error _or any of its
  causes_ have this specific type? If error handling code uses
  `findCause`, then subsystems can construct very specific causal chains
  for debuggability and still let people handle simple cases easily. There's an
  example below.
- The error's properties might change. People often hang additional properties
  off of Error objects. If we wrap an existing Error in a new Error, those
  properties would be lost unless we copied them. But there are a variety of
  both standard and non-standard Error properties that should _not_ be copied in
  this way: most obviously `name`, `message`, and `stack`, but also `fileName`,
  `lineNumber`, and a few others. Plus, it's useful for some Error subclasses
  to have their own private properties -- and there'd be no way to know whether
  these should be copied. For these reasons, VError first-classes these
  information properties. You have to provide them in the constructor, you can
  only fetch them with the `info()` function, and VError takes care of making
  sure properties from causes wind up in the `info()` output.

Let's put this all together with an example from the node-fast RPC library.
node-fast implements a simple RPC protocol for Node programs. There's a server
and client interface, and clients make RPC requests to servers. Let's say the
server fails with an UnauthorizedError with message "user 'bob' is not
authorized". The client wraps all server errors with a FastServerError. The
client also wraps all request errors with a FastRequestError that includes the
name of the RPC call being made. The result of this failed RPC might look like
this:

```
name: FastRequestError
message: "request failed: server error: user 'bob' is not authorized"
rpcMsgid: <unique identifier for this request>
rpcMethod: GetObject
  cause:
    name: FastServerError
    message: "server error: user 'bob' is not authorized"
      cause:
        name: UnauthorizedError
        message: "user 'bob' is not authorized"
        rpcUser: "bob"
```

When the caller uses `info()`, the information properties are collapsed
so that it looks like this:

```
message: "request failed: server error: user 'bob' is not authorized"
rpcMsgid: <unique identifier for this request>
rpcMethod: GetObject
rpcUser: "bob"
```

Taking this apart:

- The error's message is a complete description of the problem. The caller can
  report this directly to its caller, which can potentially make its way back to
  an end user (if appropriate). It can also be logged.
- The caller can tell that the request failed on the server, rather than as a
  result of a client problem (e.g., failure to serialize the request), a
  transport problem (e.g., failure to connect to the server), or something else
  (e.g., a timeout). They do this using `findCause('FastServerError')`
  rather than checking the `name` field directly.
- If the caller logs this error, the logs can be analyzed to aggregate
  errors by cause, by RPC method name, by user, or whatever. Or the
  error can be correlated with other events for the same rpcMsgid.
- It wasn't very hard for any part of the code to contribute to this Error.
  Each part of the stack has just a few lines to provide exactly what it knows,
  with very little boilerplate.

It's not expected that you'd use these complex forms all the time. Despite
supporting the complex case above, you can still just do:

```ts
new VError("my service isn't working");
```

for the simple cases.

# Reference: VError, WError, SError

VError, WError, and SError are convenient drop-in replacements for `Error` that
support printf-style arguments, first-class causes, informational properties,
and other useful features.

## Constructors

The VError constructor has several forms:

```ts
/*
 * This is the most general form.  You can specify any supported options
 * (including "cause" and "info") this way.
 */
new VError(options, sprintfArgs...)

/*
 * This is a useful shorthand when the only option you need is "cause".
 */
new VError(cause, sprintfArgs...)

/*
 * This is a useful shorthand when you don't need any options at all.
 */
new VError(sprintfArgs...)
```

All of these forms construct a new VError that behaves just like the built-in
JavaScript `Error` class, with some additional methods described below.

In the first form, `options` is a plain object with any of the following
optional properties:

| Option name | Type             | Meaning                                                                                                                                                                                                                                                                                |
| ----------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | string           | Describes what kind of error this is. This is intended for programmatic use to distinguish between different kinds of errors. Note that in modern versions of Node.js, this name is ignored in the `stack` property value, but callers can still use the `name` property to get at it. |
| `cause`     | any Error object | Indicates that the new error was caused by `cause`. See `cause()` below. If unspecified, the cause will be `null`.                                                                                                                                                                     |
| `strict`    | boolean          | If true, then `null` and `undefined` values in `sprintf_args` are passed through to `sprintf()`. Otherwise, these are replaced with the strings `'null'`, and '`undefined`', respectively.                                                                                             |
| `info`      | object           | Specifies arbitrary informational properties that are available through the `info(err)` function. See that method for details.                                                                                                                                                         |

The second form is equivalent to using the first form with the specified `cause`
as the error's cause. This form is distinguished from the first form because
the first argument is an Error.

The third form is equivalent to using the first form with all default option
values. This form is distinguished from the other forms because the first
argument is not an object or an Error.

The `WError` constructor is used exactly the same way as the `VError`
constructor. The `SError` constructor is also used the same way as the
`VError` constructor except that in all cases, the `strict` property is
overriden to `true.

## Public properties

`VError`, `WError`, and `SError` all provide the same public properties as
JavaScript's built-in Error objects.

| Property name | Type   | Meaning                                                                                                               |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `name`        | string | Programmatically-usable name of the error.                                                                            |
| `message`     | string | Human-readable summary of the failure. Programmatically-accessible details are provided through `info(err)` function. |
| `stack`       | string | Human-readable stack trace where the Error was constructed.                                                           |

For all of these classes, the printf-style arguments passed to the constructor
are processed with `format()` from `node:util` to form a message. For `WError`, this becomes
the complete `message` property. For `SError` and `VError`, this message is
prepended to the message of the cause, if any (with a suitable separator), and
the result becomes the `message` property.

The `stack` property is managed entirely by the underlying JavaScript
implementation. It's generally implemented using a getter function because
constructing the human-readable stack trace is somewhat expensive.

## Functions

The following methods are defined on the `VError` class and as exported
functions on the `verror` module. They're defined this way rather than using
methods on VError instances so that they can be used on Errors not created with
`VError`.

### `cause(err)`

The `cause()` function returns the next Error in the cause chain for `err`, or
`null` if there is no next error. See the `cause` argument to the constructor.
Errors can have arbitrarily long cause chains. You can walk the `cause` chain
by invoking `cause(err)` on each subsequent return value. If `err` is
not a `VError`, the cause is `null`.

### `info(err)`

Returns an object with all of the extra error information that's been associated
with this Error and all of its causes. These are the properties passed in using
the `info` option to the constructor. Properties not specified in the
constructor for this Error are implicitly inherited from this error's cause.

These properties are intended to provide programmatically-accessible metadata
about the error. For an error that indicates a failure to resolve a DNS name,
informational properties might include the DNS name to be resolved, or even the
list of resolvers used to resolve it. The values of these properties should
generally be plain objects (i.e., consisting only of null, undefined, numbers,
booleans, strings, and objects and arrays containing only other plain objects).

### `stack(err)`

Returns a string containing the full stack trace, with all nested errors recursively
reported as `'caused by:' + err.stack`.

### `findCause(err, name)`

The `findCause()` function traverses the cause chain for `err`, looking
for an error whose `name` property matches the passed in `name` value. If no
match is found, `null` is returned.

If all you want is to know _whether_ there's a cause (and you don't care what it
is), you can use `hasCause(err, name)`.

If a vanilla error or a non-VError error is passed in, then there is no cause
chain to traverse. In this scenario, the function will check the `name`
property of only `err`.

### `hasCause(err, name)`

Returns true if and only if `findCause(err, name)` would return
a non-null value. This essentially determines whether `err` has any cause in
its cause chain that has name `name`.

### `fromList(errors)`

Given an array of Error objects (possibly empty), return a single error
representing the whole collection of errors. If the list has:

- 0 elements, returns `null`
- 1 element, returns the sole error
- more than 1 element, returns a MultiError referencing the whole list

This is useful for cases where an operation may produce any number of errors,
and you ultimately want to implement the usual `callback(err)` pattern. You can
accumulate the errors in an array and then invoke
`callback(fromList(errors))` when the operation is complete.

### `errorForEach(err, func)`

Convenience function for iterating an error that may itself be a MultiError.

In all cases, `err` must be an Error. If `err` is a MultiError, then `func` is
invoked as `func(errorN)` for each of the underlying errors of the MultiError.
If `err` is any other kind of error, `func` is invoked once as `func(err)`. In
all cases, `func` is invoked synchronously.

This is useful for cases where an operation may produce any number of warnings
that may be encapsulated with a MultiError -- but may not be.

This function does not iterate an error's cause chain.

## Examples

The "Demo" section above covers several basic cases. Here's a more advanced
case:

```ts
const err1 = new VError('something bad happened');
/* ... */
const err2 = new VError(
  {
    name: 'ConnectionError',
    cause: err1,
    info: {
      errno: 'ECONNREFUSED',
      remote_ip: '127.0.0.1',
      port: 215
    }
  },
  'failed to connect to "%s:%d"',
  '127.0.0.1',
  215
);

console.log(err2.message);
console.log(err2.name);
console.log(VError.info(err2));
console.log(err2.stack);
```

This outputs:

```
    failed to connect to "127.0.0.1:215": something bad happened
    ConnectionError
    { errno: 'ECONNREFUSED', remote_ip: '127.0.0.1', port: 215 }
    ConnectionError: failed to connect to "127.0.0.1:215": something bad happened
        at Object.<anonymous> (/home/dap/node-verror/examples/info.js:5:12)
        at Module._compile (module.js:456:26)
        at Object.Module._extensions..js (module.js:474:10)
        at Module.load (module.js:356:32)
        at Function.Module._load (module.js:312:12)
        at Function.Module.runMain (module.js:497:10)
        at startup (node.js:119:16)
        at node.js:935:3
```

Information properties are inherited up the cause chain, with values at the top
of the chain overriding same-named values lower in the chain. To continue that
example:

```ts
const err3 = new VError(
  {
    name: 'RequestError',
    cause: err2,
    info: {
      errno: 'EBADREQUEST'
    }
  },
  'request failed'
);

console.log(err3.message);
console.log(err3.name);
console.log(VError.info(err3));
console.log(err3.stack);
```

This outputs:

```
    request failed: failed to connect to "127.0.0.1:215": something bad happened
    RequestError
    { errno: 'EBADREQUEST', remote_ip: '127.0.0.1', port: 215 }
    RequestError: request failed: failed to connect to "127.0.0.1:215": something bad happened
        at Object.<anonymous> (/home/dap/node-verror/examples/info.js:20:12)
        at Module._compile (module.js:456:26)
        at Object.Module._extensions..js (module.js:474:10)
        at Module.load (module.js:356:32)
        at Function.Module._load (module.js:312:12)
        at Function.Module.runMain (module.js:497:10)
        at startup (node.js:119:16)
        at node.js:935:3
```

You can also print the complete stack trace of combined `Error`s by using
`stack(err).`

```ts
const err1 = new VError('something bad happened');
/* ... */
const err2 = new VError(err1, 'something really bad happened here');

console.log(stack(err2));
```

This outputs:

```
    VError: something really bad happened here: something bad happened
        at Object.<anonymous> (/home/dap/node-verror/examples/fullStack.js:5:12)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:968:3
    caused by: VError: something bad happened
        at Object.<anonymous> (/home/dap/node-verror/examples/fullStack.js:3:12)
        at Module._compile (module.js:409:26)
        at Object.Module._extensions..js (module.js:416:10)
        at Module.load (module.js:343:32)
        at Function.Module._load (module.js:300:12)
        at Function.Module.runMain (module.js:441:10)
        at startup (node.js:139:18)
        at node.js:968:3
```

`stack` is also safe to use on regular `Error`s, so feel free to use
it whenever you need to extract the stack trace from an `Error`, regardless if
it's a `VError` or not.

# Reference: MultiError

MultiError is an Error class that represents a group of Errors. This is used
when you logically need to provide a single Error, but you want to preserve
information about multiple underlying Errors. A common case is when you execute
several operations in parallel and some of them fail.

MultiErrors are constructed as:

```ts
new MultiError(errorList);
```

`errorList` is an array of at least one `Error` object.

The cause of the MultiError is the first error provided. None of the other
`VError` options are supported. The `message` for a MultiError consists the
`message` from the first error, prepended with a message indicating that there
were other errors.

For example:

```ts
const err = new MultiError([
  new Error('failed to resolve DNS name "abc.example.com"'),
  new Error('failed to resolve DNS name "def.example.com"')
]);

// first of 2 errors: failed to resolve DNS name "abc.example.com"
console.error(err.message);
```

See the convenience function `fromList`, which is sometimes simpler
to use than this constructor.

## Public methods

### `errors()`

Returns an array of the errors used to construct this MultiError.
