# Change Log
All notable changes to this project are documented below.

The format is based on [keep a changelog](http://keepachangelog.com) and this project uses [semantic versioning](http://semver.org).

## [Unreleased]
### Added
- Add TS `nkruntime.Error` custom error type that supports a custom message and grpc status code to be returned in the server response.

### Fixed
- Fix TS `nkruntime.Context` values types.
- Add missing groupId argument from TS groupUpdate definition.

## [1.15.0] - 2021-07-08
### Added
- New functions to create custom metrics gauges, counters, and timers with Go.
- Allow Apple IAP validation to provide an override shared secret in the runtime.
- Use a context key name for fetching the lang set on a socket in the runtime.
- Add groups list, get leaderboard, and list leaderboards functions.

### Fixed
- Various updates to the TypeScript definitions.

## [1.14.0] - 2021-05-17
### Added
- Tournament and leaderboards functions can now submit scores with the score operator.
- Tournament and leaderboards functions can now use a decrement score operator.

### Changed
- Remove the older Go Protobuf dependency.
- The user ID can now be passed into group management functions. If the user ID is empty it will default to the system user as before.

### Fixed
- Small updates to the TypeScript definitions.

## [1.13.1] - 2021-04-19
### Changed
- Update to Protobuf v1.5.2 release.

## [1.13.0] - 2021-04-14
### Added
- New API to logout and intercept logouts with session and refresh tokens.
- Add a leave reason to presence events to handle transient disconnects more easily.
- New API for IAP validation with Apple App Store, Google Play Store, and Huawei AppGallery.

### Changed
- Update account wallet, storage, and session refresh in the TypeScript type definitions.

## [1.12.1] - 2021-02-15
### Changed
- Various updates to the TypeScript definitions.

### Fixed
- GetUsers in the server framework now matches more closely how the client API works.

## [1.12.0] - 2021-02-04
### Added
- New APIs for Steam friends to be imported to the social graph.

### Changed
- Improvements to the Type definitions for the runtime.
- Add an error type for negative wallet balances in wallet updates.

## [1.11.0] - 2021-01-16

This version synchronizes with the major version of Nakama server. The code is **fully backwards compatible**.

### Added
- New realtime messages for Realtime Parties.
- New API messages for refreshing session tokens.
- Type Definitions for the new JavaScript runtime framework in the server.

### Changed
- Matchmaker API messages now have support for parties.

## [1.10.0] - 2020-11-28
### Added
- Add group management functions to the server runtime. Thanks @4726.
- Add a cacheable cursor to channel message listings.

## [1.9.0] - 2020-11-02
### Added
- Runtime nakama module interfaces for TournamentRecordsList and FriendsList functions.

### Changed
- Update protobuf to 1.4.3 release.

### Fixed
- Add missing cursor in return values for nakama module GroupUsersList and UserGroupsList interfaces.

## [1.8.0] - 2020-09-28
### Added
- Use a "tool dependency" to specify the protoc-gen-go required version. See [here](https://github.com/golang/go/wiki/Modules#how-can-i-track-tool-dependencies-for-a-module).

### Changed
- Update to Protobuf 1.4.2. This enables us to take advantage of the new Protobuf runtime. See [here](https://blog.golang.org/protobuf-apiv2).
- Rename example runtime file.
- Replace shell script with Go generate commands to run protoc toolchain.
- Eliminate test dependency on GRPC runtime.
- Update protocol definitions to remove warnings from stricter Go package import paths. See [here](https://developers.google.com/protocol-buffers/docs/reference/go-generated#package).
