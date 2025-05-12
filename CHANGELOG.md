# Change Log
All notable changes to this project are documented below.

The format is based on [keep a changelog](http://keepachangelog.com) and this project uses [semantic versioning](http://semver.org).

## [Unreleased]

## [1.37.0] - 2025-05-12
### Added
- Add Satori client API to list Flags Overrides.

### Changed
- Update to Protobuf v1.36.6 dependency.

## [1.36.0] - 2025-01-25
### Added
- Add friend metadata support.
- Extra options to pass through client address to runtime Satori event publishing.
- Additional runtime Satori authentication function options.

### Changed
- Update to Protobuf v1.36.4 dependency.

## [1.35.0] - 2024-11-25
### Added
- Add new runtime function to get a list of user's friend status.
- Add new Follow/Unfollow runtime APIs.
- Add new NotificationsUpdate runtime API.
- Add new initializers function to get config values.

### Changed
- Update to Protobuf v1.35.2 dependency.

## [1.34.0] - 2024-10-21
### Added
- New runtime function to list user notifications.
- New Go runtime initializer function to register raw HTTP handlers.

### Changed
- Added pagination support to storage index listing.
- Ensure runtime Satori client is updated for latest API changes.

### Fixed
- Ensure optional TypeScript context fields are marked appropriately.

## [1.33.0] - 2024-07-27
### Added
- New runtime functions to get and delete notifications by id.
- Add runtime function to disable ranks for an active leaderboard.
- Add new get matchmaker stats API.

### Changed
- Add leaderboard and tournament create param to enable or disable ranks.

### Fixed
- Add ErrGracePeriodExpired.

## [1.32.0] - 2024-06-09
### Added
- Add runtime support for registering a shutdown hook function.
- Add support for custom sorting in storage index search.
- New friends of friends listing API and runtime functions.

### Changed
- Update to Protobuf v1.34.1 dependency.

### Fixed
- Fix JavaScript runtime `MatchInit` parameter type.

## [1.31.0] - 2024-03-17
### Added
- Add Fleet Manager API to power session-based multiplayer integrations. See [the documentation](https://heroiclabs.com/docs/nakama/concepts/multiplayer/session-based/) for more details.
- Add CRON next and previous functions to Go runtime.
- Add CRON previous function to Lua runtime.
- Add CRON previous function to TypeScript/JavaScript runtime.
- Add support for storage deletes in runtime multi-update functions.

## [1.30.1] - 2023-12-15
### Added
- Add JavaScript runtime `channelMessageRemove` function definition.

## [1.30.0] - 2023-11-11
### Added
- Add optional client IP address passthrough to runtime Satori client.
- Add Lua runtime function to clear all localcache data.
- Add JavaScript runtime function to clear all localcache data.
- Add support for per-key TTL in Lua runtime localcache.
- Add support for per-key TTL in JavaScript runtime localcache.
- Add IAP purchase validation support for Facebook Instant Games.

## [1.29.0] - 2023-10-24
### Added
- Runtime functions to build a leaderboard record list cursor to start listing from a given rank.
- Runtime storage list operations now accept a caller user identifier.

### Fixed
- Fix linter-found test issue.
- Fix storage index listing results sometimes being returned with incorrect order.

### Changed
- Add create_time and update_time to returned storage engine writes acks.
- Add storage index create flag to read only from the index.

## [1.28.1] - 2023-08-23
### Added
- Add Satori `recompute` optional input parameter to relevant operations.

### Changed
- Use generics in realtime before and after TS runtime hook definitions.

### Fixed
- Use correct Satori live event active start and end time field type.

## [1.28.0] - 2023-07-19
### Added
- Add storage object indexing support and related runtime functions.
- Add missing TypeScript validated subscription fields.
- Add TypeScript error code mappings to HTTP status codes.
- Add rank count parameter to leaderboard score listings.
- Add rank count parameter to tournament score listings.

### Changed
- Remove incorrect category start and category end parameters from runtime leaderboard list functions.
- Update to Protobuf v1.31.0 dependency.

## [1.27.0] - 2023-04-18
### Added
- Add local cache functions to JavaScript server framework.
- Add "tournamentRecordDelete" function to server frameworks.
- New "insecure" flag to "httpRequest" TypeScript function.
- [Satori](https://heroiclabs.com/satori/) API available to Nakama server in all server frameworks.
- New "MatchmakerOverride" hook to provide custom matching behaviour.

### Changed
- User ID is now returned in ValidatedSubscription, and ValidatedPurchases types.
- ValidatedSubscription types are visible to the Go server framework.
- Add "refundTime" field to TypeScript ValidatedSubscription type.
- Loosened TypeScript definitions to allow for no identifier to be passed to Unlink operations.

### Fixed
- Various small TypeScript definitions fixes.

## [1.26.0] - 2023-01-04
### Added
- Add party hook messages to JavaScript runtime.
- Add In-App Purchase notification callback functions to the server runtimes.
- Add "DeleteAccount" before and after hook functions to the server runtimes.

## Changed
- Accept the leaderboard operator types in their expanded string name.
- Added userID param to Go runtime GroupUpdate function.

## Fixed
- Update Type definition for "authenticateTokenGenerate" to support the optional params allowed by the server.
- Make public the "ChannelMessageRemove" function to the server Go runtime.
- Allow DELETE method to be used in HTTP requests.

## [1.25.0] - 2022-10-14
### Added
- New "GroupsGetRandom" function added to the runtimes.
- New "NotificationsDelete" function added to the runtimes.
- The server version is now visible to server framework code within the context object.

### Changed
- JavaScript runtime Base64 encode accepts string or ArrayBuffer input.
- JavaScript runtime Base64 URL encode accepts string or ArrayBuffer input.
- JavaScript runtime Base16 encode accepts string or ArrayBuffer input.
- JavaScript runtime Base64 decode returns ArrayBuffer output.
- JavaScript runtime Base64 URL decode returns ArrayBuffer output.
- JavaScript runtime Base16 decode returns ArrayBuffer output.
- The groupUpdate function argument for a user ID is now optional in the type definition.
- Update to Protobuf v1.28.1 dependency.

### Fixed
- Add user ID to JS runtime wallet operations returned results.
- Type definition for field name used in MatchMessage type is correct in TypeScript.

## [1.24.0] - 2022-08-18
### Added
- New subscription validation functions for Apple and Google in the runtimes.
- Add "NotificationsDelete" function to the runtimes.
- Add const field for easier access to system user ID in TypeScript definition.

### Changed
- Return a cursor with "leaderboardRecordsHaystack" function.
- Use ArrayBuffer type instead of Uint8Array in JavaScript runtime. Thanks @formatCvt.
- Expose optional "recorded" param to "accountDeleteId" in TypeScript definition.

### Fixed
- Fix function signature of "leaderboardRecordsHaystack" in TypeScript definition.
- Fix signature of "authenticateGameCenter" in TypeScript definition.
- Update field name used in Friend type in TypeScript definition.

## [1.23.0] - 2022-05-22
### Added
- Add custom metrics publishing functions to Lua and JavaScript runtimes.
- Add missing "sessionLogout" TypeScript definition.
- Add "FriendsBlock" function to the Lua and JavaScript runtimes.
- Add "ChannelMessagesList" function to the Lua and JavaScript runtimes.
- New "countMultiple" parameter in the "MatchmakerAdd" TypeScript definition.

### Changed
- Update naming of delete notifications before/after hook registration functions.
- Allow storage writes to accept "undefined" as a user ID input in the TypeScript definitions.

### Fixed
- Rename field in "ValidatedPurchase" to "providerResponse" to match what the server returns.
- Add missing "label" field to "Match" TypeScript definition.

## [1.22.0] - 2022-03-21
### Added
- Add "GroupUsersBan" function to the runtimes.
- Add "FriendsAdd" and "FriendsDelete" functions to the runtimes.
- Add "LeaderboardRecordsHaystack" function to the runtimes.
- Add "NotificationSendAll" function to the runtimes, for sending a notification to all users.
- Propagate outgoing envelopes in realtime message after hooks.
- Add inputs for matchmaker option to enforce a multiple of resulting matched count.

### Changed
- Add senderID param to "channelIdBuild".

## [1.21.0] - 2021-12-16
### Added
- Add ctx field to access http request headers in the Lua and JavaScript runtimes.
- New JavaScript runtime stringToBinary and binaryToString functions.

### Changed
- JavaScript runtime match data changed to use Uint8Array type.
- Added IAP validation `persist` parameter to make persistence optional.

## [1.20.0] - 2021-10-29
### Added
- Allow creation of relayed matches with a name. Names are still mapped to match identifiers.

### Changed
- Expose Nakama errors to the server runtime.

## [1.19.0] - 2021-10-15
### Added
- Match signal handler as part of the match handler definition.
- Add match signal function to server framework.
- Add a prev cursor to the PurchaseList message.

## [1.18.0] - 2021-09-28
### Changed
- Use named return parameters in leaderboard and tournament listings.
- Add authoritative parameter on tournament create. Same as in leaderboard create.

## [1.17.0] - 2021-09-09
### Added
- Add ChannelMessageUpdate function to server framework.

### Fixed
- Improve ValidatedPurchase TS definitions.
- Show "rank" field in leaderboard record TS definition.

## [1.16.0] - 2021-08-10
### Added
- Add TypeScript "nkruntime.Error" custom error type that supports a custom message and grpc status code which can be returned in server responses.
- Add function to retrieve a random set of users to server framework.
- Add ChannelMessageSend function to server framework.
- Add BuildChannelId function to server framework.

### Changed
- Return already seen receipts with a 'seen_before' flag set to true instead of returning an error if one is detected.

### Fixed
- Fix TypeScript "nkruntime.Context" value types.
- Add missing groupId argument from groupUpdate TypeScript definition.

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
