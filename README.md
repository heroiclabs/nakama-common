nakama-common
======

Common protocol message and runtime interface definitions used by [Nakama](https://github.com/heroiclabs/nakama).

## Getting Started

This repository defines a set of main high level packages:
* `api` - Core protocol message definitions used by Nakama as input/output with various server operations.
* `rtapi` - Protocol message definitions used by Nakama for realtime communication with clients over bi-directional socket connections.
* `runtime` - Go types and interface definitions that Nakama runtime plugins are expected to conform to. Read more in the [Nakama runtime documentation](https://heroiclabs.com/docs/runtime-code-basics/).

### Installation

**Note:** Go 1.13 or above is required.

To pull in `nakama-common` as a dependency set up your plugin project's `go.mod` file and run:

```shell
go get -u "github.com/heroiclabs/nakama-common"
```

This will add a new dependency to the latest version of `nakama-common` and allow you to build your project with:

```shell
go build -buildmode=plugin -trimpath
```

Read more about building Go plugins for Nakama in the [runtime documentation](https://heroiclabs.com/docs/runtime-code-basics/).

## Contribute

The codebase uses Protocol Buffers as part of the project. This dependency is used to generate source files, which are committed to the repository to simplify builds for contributors.

To build the codebase and generate all sources use these steps.

1. Install the toolchain.

    ```shell
    go get -u github.com/golang/protobuf/protoc-gen-go
    ```

2. Compile protocol buffers files.

    ```shell
    ./generate_proto_gocode
    ```

The `generate_proto_gocode` script contains detailed commands to build protobuf source files for both the `api` and `rtapi` packages.

### License

This project is licensed under the [Apache-2 License](https://github.com/heroiclabs/nakama-common/blob/master/LICENSE).
