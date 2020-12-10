nakama-common
===

> The runtime framework for Nakama server.

This codebase defines the runtime API and protocol interface used by [Nakama](https://github.com/heroiclabs/nakama).

The code is broken up into packages for different parts of the runtime framework:

* `api` - The request/response messages used with GRPC and in some of the realtime API.
* `rtapi` - The realtime messages sent and received over a socket connection.
* `runtime` - The Go types and functional interface used by Nakama plugins to execute native logic. See the Nakama [server documentation](https://heroiclabs.com/docs/runtime-code-basics/) for more info.

### Contribute

The codebase uses Protocol Buffers. The protoc toolchain is used to generate source files which are committed to the repository to simplify builds for contributors.

To build the codebase and generate all sources use these steps.

1. Install the Go toolchain and protoc toolchain.

2. Intall the protoc-gen-go plugin to generate Go code.

   ```shell
   go install "google.golang.org/protobuf/cmd/protoc-gen-go"
   ```

3. Use the Go generate command to generate all Go stubs.

   ```shell
   env PATH="$HOME/go/bin:$PATH" go generate -x ./...
   ```

These steps have been tested with the Go 1.14 toolchain. Earlier Go toolchain versions may work though YMMV.

### Using this Go package

To use the Go language with your Nakama server project you compile your code as a shared object. Use these basic steps to set up the Go project and consult the [documentation](https://heroiclabs.com/docs/runtime-code-basics/) for more information.

1. Install the Go toolchain.

   __NOTE:__ You must use the exact same version of the Go toolchain as the specific release the server was built with. Run the server with "--logger.level DEBUG" to see the version of the Go runtime used.

2. Create a Go project.

   ```shell
   go mod init "myproject/server"
   ```

3. Add this package as a dependency to the project and vendor it.

   ```shell
   go get -u "github.com/heroiclabs/nakama-common/runtime"
   go mod vendor
   ```

3. Write your Go code and compile it as a Go plugin

   ```shell
   go build -buildmode=plugin -trimpath
   ```

### Release Process

Make sure that the `package.json` version is in tandem with the go package releases.

### License

This project is licensed under the [Apache-2 License](https://github.com/heroiclabs/nakama-common/blob/master/LICENSE).
