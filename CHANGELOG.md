# Change Log
All notable changes to this project are documented below.

The format is based on [keep a changelog](http://keepachangelog.com) and this project uses [semantic versioning](http://semver.org).

## [Unreleased]


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
