// Copyright 2021 The Nakama Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

declare namespace nkruntime {

    /**
     * The context of the current execution; used to observe and pass on cancellation signals.
     */
    export type Context = {
        env: {[key: string]: string},
        executionMode: string,
        node: string,
        headers: {[key: string]: string[]},
        queryParams: {[key: string]: string[]},
        userId: string,
        username: string,
        vars: {[key: string]: string}
        userSessionExp: number,
        sessionId: string,
        clientIp: string,
        clientPort: string,
        matchId: string,
        matchNode: string,
        matchLabel: string,
        matchTickRate: number,
        lang: string,
    }

    type ReadPermissionValues = 0 | 1 | 2;
    type WritePermissionValues = 0 | 1;

    /**
     * GRPC Error codes supported for thrown custom errors.
     *
     * These errors map to HTTP status codes as shown here: https://github.com/grpc/grpc/blob/master/doc/http-grpc-status-mapping.md/.
     */
    const enum Codes {
        CANCELLED = 1, // The operation was cancelled, typically by the caller.
        UNKNOWN = 2, // Unknown error. For example, this error may be returned when a Status value received from another address space belongs to an error space that is not known in this address space. Also errors raised by APIs that do not return enough error information may be converted to this error.
        INVALID_ARGUMENT = 3, // The client specified an invalid argument. Note that this differs from FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are problematic regardless of the state of the system (e.g., a malformed file name).
        DEADLINE_EXCEEDED = 4, // The deadline expired before the operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully. For example, a successful response from a server could have been delayed long
        NOT_FOUND = 5, // Some requested entity (e.g., file or directory) was not found. Note to server developers: if a request is denied for an entire class of users, such as gradual feature rollout or undocumented allowlist, NOT_FOUND may be used. If a request is denied for some users within a class of users, such as user-based access control, PERMISSION_DENIED must be used.
        ALREADY_EXISTS = 6, // The entity that a client attempted to create (e.g., file or directory) already exists.
        PERMISSION_DENIED = 7, // The caller does not have permission to execute the specified operation. PERMISSION_DENIED must not be used for rejections caused by exhausting some resource (use RESOURCE_EXHAUSTED instead for those errors). PERMISSION_DENIED must not be used if the caller can not be identified (use UNAUTHENTICATED instead for those errors). This error code does not imply the request is valid or the requested entity exists or satisfies other pre-conditions.
        RESOURCE_EXHAUSTED = 8, // Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.
        FAILED_PRECONDITION = 9, // The operation was rejected because the system is not in a state required for the operation's execution. For example, the directory to be deleted is non-empty, an rmdir operation is applied to a non-directory, etc. Service implementors can use the following guidelines to decide between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE: (a) Use UNAVAILABLE if the client can retry just the failing call. (b) Use ABORTED if the client should retry at a higher level (e.g., when a client-specified test-and-set fails, indicating the client should restart a read-modify-write sequence). (c) Use FAILED_PRECONDITION if the client should not retry until the system state has been explicitly fixed. E.g., if an "rmdir" fails because the directory is non-empty, FAILED_PRECONDITION should be returned since the client should not retry unless the files are deleted from the directory.
        ABORTED = 10, // The operation was aborted, typically due to a concurrency issue such as a sequencer check failure or transaction abort. See the guidelines above for deciding between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE.
        OUT_OF_RANGE = 11, // The operation was attempted past the valid range. E.g., seeking or reading past end-of-file. Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed if the system state changes. For example, a 32-bit file system will generate INVALID_ARGUMENT if asked to read at an offset that is not in the range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from an offset past the current file size. There is a fair bit of overlap between FAILED_PRECONDITION and OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error) when it applies so that callers who are iterating through a space can easily look for an OUT_OF_RANGE error to detect when they are done.
        UNIMPLEMENTED = 12, // The operation is not implemented or is not supported/enabled in this service.
        INTERNAL = 13, // Internal errors. This means that some invariants expected by the underlying system have been broken. This error code is reserved for serious errors.
        UNAVAILABLE = 14, // The service is currently unavailable. This is most likely a transient condition, which can be corrected by retrying with a backoff. Note that it is not always safe to retry non-idempotent operations.
        DATA_LOSS = 15, // Unrecoverable data loss or corruption.
        UNAUTHENTICATED = 16, // The request does not have valid authentication credentials for the operation.
    }

    /**
     * A custom Runtime Error
     */
    export type Error = {
        message: string
        code: Codes
    }

    /**
     * An RPC function definition.
     */
    export interface RpcFunction {
        /**
         * An RPC function to be executed when called by ID.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param payload - The input data to the function call. This is usually an escaped JSON object.
         * @throws {TypeError}
         * @returns A response payload or error if one occurred.
         */
        (ctx: Context, logger: Logger, nk: Nakama, payload: string): string | void;
    }

    /**
     * A Before Hook function definition.
     */
    export interface BeforeHookFunction<T> {
        /**
         * A Register Hook function definition.
         *
         * @remarks
         * The function must return the T payload as this is what will be passed on to the hooked function.
         * Return null to bail out of executing the function instead.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param data - The input data to the function call.
         * @returns The escaped JSON payload.
         */
        (ctx: Context, logger: Logger, nk: Nakama, data: T): T | void;
    }

    /**
     * A After Hook function definition.
     */
    export interface AfterHookFunction<T, K> {
        /**
         * A Register Hook function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param data - The data returned by the function call.
         * @param request - The request payload.
         */
        (ctx: Context, logger: Logger, nk: Nakama, data: T, request: K): void;
    }

    /**
     * A realtime before hook function definition.
     */
    export interface RtBeforeHookFunction<T extends Envelope> {
        /**
         * A Register Hook function definition.
         *
         * * @remarks
         * The function must return the T payload as this is what will be passed on to the hooked function.
         * Return null to bail out of executing the function instead.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param envelope - The Envelope message received by the function.
         */
        (ctx: Context, logger: Logger, nk: Nakama, envelope: T): T | void;
    }

    /**
     * A realtime after hook function definition.
     */
    export interface RtAfterHookFunction<T extends Envelope> {
        /**
         * A Register Hook function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param output - The response envelope, if any.
         * @param input - The Envelope message received by the function.
         */
        (ctx: Context, logger: Logger, nk: Nakama, output: T | null, input: T): void;
    }

    /**
     * Matchmaker matched hook function definition.
     */
    export interface MatchmakerMatchedFunction {
        /**
         * A Matchmaker matched register hook function definition.
         *
         * @remarks
         * Expected to return an authoritative match ID for a match ready to receive
         * these users, or void if the match should proceed through the peer-to-peer relayed mode.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param matches - The matched users presences and properties.
         */
        (ctx: Context, logger: Logger, nk: Nakama, matches: MatchmakerResult[]): string | void;
    }

    /**
     * Tournament end hook function definition.
     */
    export interface TournamentEndFunction {
         /**
         * A Tournament end register hook function definition.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param tournament - The ended tournament.
         * @param end - End time unix timestamp.
         * @param reset - Reset time unix timestamp.
         */
        (ctx: Context, logger: Logger, nk: Nakama, tournament: Tournament, end: number, reset: number): void;
    }

    /**
     * Tournament reset hook function definition.
     */
    export interface TournamentResetFunction {
        /**
         * A Tournament reset register hook function definition.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param tournament - The reset tournament.
         * @param end - End time unix timestamp.
         * @param reset - Reset time unix timestamp.
         */
        (ctx: Context, logger: Logger, nk: Nakama, tournament: Tournament, end: number, reset: number): void;
    }

    /**
     * Leaderboard reset hook function definition.
     */
    export interface LeaderboardResetFunction {
        /**
         * A Leaderboard reset register hook function definition.
         *
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param leaderboard - The reset leaderboard.
         * @param reset - Reset time unix timestamp.
         */
        (ctx: Context, logger: Logger, nk: Nakama, leaderboard: Leaderboard, reset: number): void;
    }

    /**
     * Match Dispatcher API definition.
     */
    export interface MatchDispatcher {
        /**
         * Broadcast a message to match presences.
         *
         * @param opcode - Numeric message op code.
         * @param data - Opt. Data payload string, or null.
         * @param presences - Opt. List of presences (a subset of match participants) to use as message targets, or null to send to the whole match. Defaults to null.
         * @param sender - Opt. A presence to tag on the message as the 'sender', or null.
         * @param reliable - Opt. Broadcast the message with delivery guarantees or not. Defaults to true.
         * @throws {TypeError, GoError}
         */
        broadcastMessage(opcode: number, data?: ArrayBuffer | string | null, presences?: Presence[] | null, sender?: Presence | null, reliable?: boolean): void;

        /**
         * Defer message broadcast to match presences.
         *
         * @param opcode - Numeric message op code.
         * @param data - Opt. Data payload string, or null.
         * @param presences - Opt. List of presences (a subset of match participants) to use as message targets, or null to send to the whole match. Defaults to null
         * @param sender - Opt. A presence to tag on the message as the 'sender', or null.
         * @param reliable - Opt. Broadcast the message with delivery guarantees or not. Defaults to true.
         * @throws {TypeError, GoError}
         */
        broadcastMessageDeferred(opcode: number, data?: ArrayBuffer | string | null, presences?: Presence[] | null, sender?: Presence, reliable?: boolean): void;

        /**
         * Kick presences from match.
         *
         * @param presences - List of presences to kick from the match.
         * @throws {TypeError, GoError}
         */
        matchKick(presences: Presence[]): void;

        /**
         * Update match label.
         *
         * @param label - New label for the match.
         * @throws {TypeError, GoError}
         */
        matchLabelUpdate(label: string): void;
    }

    type SessionVars = {[key: string]: string}

    /**
     * Match Message definition
     */
    export interface MatchMessage {
        sender: Presence;
        persistence: boolean;
        status: string;
        opCode: number;
        data: ArrayBuffer;
        reliable: boolean;
        receiveTime: number;
    }

    /**
     * Match state definition
     */
    export interface MatchState {
        [key: string]: any;
    }

    /**
     * Hooks payloads definitions
     */
    export interface AccountApple {
        token?: string
        vars?: SessionVars
    }

    export interface AuthenticateAppleRequest {
        account?: AccountApple
        create?: boolean
        username?: string
    }

    export interface AccountCustom {
        id?: string
        vars?: SessionVars
    }

    export interface AuthenticateCustomRequest {
        account?: AccountCustom
        create?: boolean
        username?: string
    }

    export interface AuthenticateDeviceRequest {
        account?: AccountDevice
        create?: boolean
        username?: string
    }

    export interface AccountEmail {
        email?: string
        password?: string
        vars?: SessionVars
    }

    export interface AuthenticateEmailRequest {
        account: AccountEmail
        create: boolean
        username: string
    }

    export interface AuthenticateFacebookRequest {
        account?: AccountFacebook
        create?: boolean
        username?: string
        sync?: boolean
    }

    export interface AccountFacebook {
        token?: string
        vars?: SessionVars
    }

    export interface AccountFacebookInstantGame {
        signedPlayerInfo?: string
        vars?: SessionVars
    }

    export interface AuthenticateFacebookInstantGameRequest {
        account?: AccountFacebookInstantGame
        create?: boolean
        username?: string
    }

    export interface AccountGameCenter {
        playerId?: string
        bundleId?: string
        timestampSeconds?: string
        salt?: string
        signature?: string
        publicKeyUrl?: string
        vars?: SessionVars
      }

    export interface AuthenticateGameCenterRequest {
        account?: AccountGameCenter
        create?: boolean
        username?: string
    }

    export interface AccountGoogle {
        token?: string
        vars?: SessionVars
    }

    export interface AuthenticateGoogleRequest {
        account?: AccountGoogle
        create?: boolean
        username?: string
    }

    export interface AccountSteam {
        token?: string
        vars?: SessionVars
    }

    export interface AuthenticateSteamRequest {
        account?: AccountSteam
        create?: boolean
        username?: string
    }

    export interface ListChannelMessagesRequest {
        channelId?: string
        limit?: number
        forward?: boolean
        cursor?: string
    }

    export interface ChannelMessage {
        channelId?: string
        messageId?: string
        code?: number
        senderId?: string
        username?: string
        content?: string
        createTime?: number
        updateTime?: number
        persistent?: boolean
        roomName?: string
        groupId?: string
        userIdOne?: string
        userIdTwo?: string
    }

    export interface ListFriendsRequest {
        limit?: number
        state?: number
        cursor?: string
    }

    export interface AddFriendsRequest {
        ids?: string[]
        usernames?: string[]
    }

    export interface DeleteFriendsRequest {
        ids?: string[]
        usernames?: string[]
    }

    export interface BlockFriendsRequest {
        ids?: string[]
        usernames?: string[]
    }

    export interface ImportFacebookFriendsRequest {
        account?: AccountFacebook
        reset?: boolean
    }

    export interface ImportSteamFriendsRequest {
        account?: AccountSteam
        reset?: boolean
    }

    export interface CreateGroupRequest {
        name?: string
        description?: string
        langTag?: string
        avatarUrl?: string
        open?: boolean
        maxCount?: number
    }

    export interface UpdateGroupRequest {
        name?: string
        description?: string
        langTag?: string
        avatarUrl?: string
        open?: boolean
    }

    export interface DeleteGroupRequest {
        groupId?: string
    }

    export interface JoinGroupRequest {
        groupId?: string
    }

    export interface LeaveGroupRequest {
        groupId?: string
    }

    export interface AddGroupUsersRequest {
        groupId?: string
        userIds?: string[]
    }

    export interface BanGroupUsersRequest {
        groupId?: string
        userIds?: string[]
    }

    export interface KickGroupUsersRequest {
        groupId?: string
        userIds?: string[]
    }

    export interface PromoteGroupUsersRequest {
        groupId?: string
        userIds?: string[]
    }

    export interface DemoteGroupUsersRequest {
        groupId?: string
        userIds?: string[]
    }

    export interface ListGroupUsersRequest {
        groupId?: string
        limit?: number
        state?: number
        cursor?: string
    }

    export interface ListUserGroupsRequest {
        userId?: string
        limit?: number
        state?: number
        cursor?: string
    }

    export interface ListGroupsRequest {
        name?: string
        cursor?: string
        limit?: number
    }

    export interface DeleteLeaderboardRecordRequest {
        leaderboardId?: string
    }

    export interface ListLeaderboardRecordsRequest {
        leaderboardId?: string
        ownerIds?: string[]
        limit?: number
        cursor?: string
        expiry?: string
    }

    export interface WriteLeaderboardRecordRequestLeaderboardRecordWrite {
        score?: string
        subscore?: string
        metadata?: string
    }

    export interface WriteLeaderboardRecordRequest {
        leaderboardId?: string
        record?: WriteLeaderboardRecordRequestLeaderboardRecordWrite
    }

    export interface ListLeaderboardRecordsAroundOwnerRequest {
        leaderboardId?: string
        limit?: number
        ownerId?: string
        expiry?: string
    }

    export interface AccountApple {
        token?: string
        vars?: SessionVars
    }

    export interface AccountAppleVarsEntry {
        key?: string
        value?: string
    }

    export interface AccountCustom {
        id?: string
        vars?: SessionVars
    }

    export interface AccountCustomVarsEntry {
        key?: string
        value?: string
    }

    export interface LinkFacebookRequest {
        account?: AccountFacebook
        sync?: boolean
    }

    export interface LinkSteamRequest {
        account?: AccountSteam
        sync?: boolean
    }

    export interface ListMatchesRequest {
        limit?: number
        authoritative?: boolean
        label?: string
        minSize?: number
        maxSize?: number
        query?: string
    }

    export interface ListNotificationsRequest {
        limit?: number
        cacheableCursor?: string
    }

    export interface ListStorageObjectsRequest {
        collection: string
        userId: string
        limit: number
        cursor: string
    }

    export interface ReadStorageObjectId {
        collection?: string
        key?: string
        userId?: string
    }

    export interface ReadStorageObjectsRequest {
        objectIds?: ReadStorageObjectId[]
    }

    export interface WriteStorageObject {
        collection?: string
        key?: string
        value?: string
        version?: string
        permissionRead?: number
        permissionWrite?: number
    }

    export interface WriteStorageObjectsRequest {
        objects?: WriteStorageObject[]
    }

    export interface DeleteStorageObjectId {
        collection?: string
        key?: string
        version?: string
      }

    export interface DeleteStorageObjectsRequest {
        objectIds?: DeleteStorageObjectId[]
    }

    export interface JoinTournamentRequest {
        tournamentId?: string
    }

    export interface ListTournamentRecordsRequest {
        tournamentId?: string
        ownerIds?: string[]
        limit?: number
        cursor?: string
        expiry?: string
    }

    export interface ListTournamentsRequest {
        categoryStart?: number
        categoryEnd?: number
        startTime?: number
        endTime?: number
        limit?: number
        cursor?: string
    }

    export interface WriteTournamentRecordRequest {
        tournamentId?: string
        record?: WriteTournamentRecordRequestTournamentRecordWrite
    }

    export interface WriteTournamentRecordRequestTournamentRecordWrite {
        score?: string
        subscore?: string
        metadata?: string
    }

    export interface ListTournamentRecordsAroundOwnerRequest {
        tournamentId?: string
        limit?: number
        ownerId?: string
        expiry?: string
    }

    export interface GetUsersRequest {
        ids?: string[]
        usernames?: string[]
        facebookIds?: string[]
    }

    export interface Event {
        name?: string
        properties?: EventPropertiesEntry[]
        timestamp?: string
        external?: boolean
    }

    export interface EventPropertiesEntry {
        key?: string
        value?: string
    }

    export interface Session {
        created?: boolean
        token?: string
        refreshToken?: string
    }

    export interface ChannelMessageList {
        messages?: ChannelMessage[]
        nextCursor?: string
        prevCursor?: string
        cacheableCursor?: string
    }

    export interface Friend {
        user?: User
        state?: number
        update_time?: number
    }

    export interface FriendList {
        friends?: Friend[]
        cursor?: string
    }

    const enum GroupUserState {
        Superadmin = 0,
        Admin = 1,
        Member = 2,
        JoinRequest = 3,
    }

    export interface GroupUser {
        user: User
        state?: GroupUserState
    }

    export interface GroupUserList {
        groupUsers?: GroupUser[]
        cursor?: string
    }

    export interface LeaderboardRecordList {
        records?: LeaderboardRecord[]
        ownerRecords?: LeaderboardRecord[]
        nextCursor?: string
        prevCursor?: string
    }

    export interface MatchList {
        matches: Match[]
    }

    export interface DeleteNotificationsRequest {
        ids: string[]
    }

    export interface StorageObjectList {
        objects?: StorageObject[]
        cursor?: string
    }

    export interface StorageObjects {
        objects?: StorageObject[]
    }

    export interface TournamentRecordList {
        records?: LeaderboardRecord[]
        ownerRecords?: LeaderboardRecord[]
        prevCursor?: string
        nextCursor?: string
    }

    export interface TournamentList {
        tournaments: Tournament[]
        cursor?: string
    }

    export interface Users {
        users: Users[]
    }

    export interface MatchmakerResult {
        properties: {[key: string]: string}
        presence: Presence
        partyId?: string
    }

    export interface LeaderboardList {
        leaderboards: Leaderboard[]
        cursor?: string
    }

    /**
     * Realtime hook messages
     */
    export type RtHookMessage = 'ChannelJoin' | 'ChannelLeave' | 'ChannelMessageSend' | 'ChannelMessageUpdate' | 'ChannelMessageRemove' | 'MatchCreate' | 'MatchDataSend' | 'MatchJoin' | 'MatchLeave' | 'MatchmakerAdd' | 'MatchmakerRemove' | 'StatusFollow' | 'StatusUnfollow' | 'StatusUpdate' | 'Ping' | 'Pong'

    /**
     * Match handler definitions
     */
    export interface MatchHandler<State = MatchState> {
        matchInit: MatchInitFunction<State>;
        matchJoinAttempt: MatchJoinAttemptFunction<State>;
        matchJoin: MatchJoinFunction<State>;
        matchLeave: MatchLeaveFunction<State>;
        matchLoop: MatchLoopFunction<State>;
        matchTerminate: MatchTerminateFunction<State>;
        matchSignal: MatchSignalFunction<State>;
    }

    /**
     * Match initialization function definition.
     */
    export interface MatchInitFunction<State = MatchState> {
        /**
         * Match initialization function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param params - Match create http request parameters.
         * @returns An object with the match state, tick rate and labels.
         */
        (ctx: Context, logger: Logger, nk: Nakama, params: {[key: string]: string}): {state: State, tickRate: number, label: string};
    }

    /**
     * Match join attempt function definition.
     */
    export interface MatchJoinAttemptFunction<State = MatchState> {
        /**
         * User match join attempt function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param presence - Presence of user attempting to join.
         * @param metadata - Metadata object.
         * @returns object with state, acceptUser and optional rejection message if acceptUser is false.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, presence: Presence, metadata: {[key: string]: any}): {state: State, accept: boolean, rejectMessage?: string} | null;
    }

    /**
     * Match join function definition.
     */
    export interface MatchJoinFunction<State = MatchState> {
        /**
         * User match join function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param presences - List of presences.
         * @returns object with the new state of the match.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, presences: Presence[]): {state: State} | null;
    }

    /**
     * Match leave function definition.
     */
    export interface MatchLeaveFunction<State = MatchState> {
        /**
         * User match leave function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param presences - List of presences.
         * @returns object with the new state of the match.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, presences: Presence[]): {state: State} | null;
    }

    /**
     * Match loop function definition.
     */
    export interface MatchLoopFunction<State = MatchState> {
        /**
         * User match leave function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param messages - Received messages in the buffer.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, messages: MatchMessage[]): {state: State} | null;
    }

    /**
     * Match terminate function definition.
     */
    export interface MatchTerminateFunction<State = MatchState> {
        /**
         * User match leave function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param graceSeconds - Number of seconds to gracefully terminate the match. If this time elapses before the function returns the match will be forcefully terminated.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, graceSeconds: number): {state: State} | null;
    }

    /**
     * Match signal function definition.
     */
    export interface MatchSignalFunction<State = MatchState> {
        /**
         * User match leave function definition.
         * @param ctx - The context for the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param dispatcher - Message dispatcher APIs.
         * @param tick - Current match loop tick.
         * @param state - Current match state.
         * @param data - Arbitrary data the signal caller is sending to the match signal handler.
         * @returns object with state and optional response data string to the signal caller.
         */
        (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: State, data: string): {state: State, data?: string} | null;
    }

    /**
     * The injector used to initialize features of the game server.
     */
    export interface Initializer {
        /**
         * Register an RPC function by its ID to be called as a S2S function or by game clients.
         *
         * @param id - The ID of the function in the server.
         * @param func - The RPC function logic to execute when the RPC is called.
         */
        registerRpc(id: string, func: RpcFunction): void;

        /**
         * Register a hook function to be run before an RPC function is invoked.
         * The RPC call is identified by the id param.
         *
         * @param id - The ID of the RPC function.
         * @param func - The Hook function logic to execute before the RPC is called.
         */
        registerRtBefore(id: RtHookMessage, func: RtBeforeHookFunction<Envelope>): void;

        /**
         * Register a hook function to be run after an RPC function is invoked.
         * The RPC call is identified by the id param.
         *
         * @param id - The ID of the RPC function.
         * @param func - The Hook function logic to execute after the RPC is called.
         */
        registerRtAfter(id: RtHookMessage, func: RtAfterHookFunction<Envelope>): void;

        /**
         * Register Before Hook for RPC getAccount function.
         *
         * @param fn - The function to execute before getAccount.
         * @throws {TypeError}
         */
        registerBeforeGetAccount(fn: BeforeHookFunction<void>): void;

        /**
         * Register After Hook for RPC getAccount function.
         *
         * @param fn - The function to execute after getAccount.
         * @throws {TypeError}
         */
        registerAfterGetAccount(fn: AfterHookFunction<Account, void>): void;

        /**
         * Register before Hook for RPC updateAccount function.
         *
         * @param fn - The function to execute before updateAccount.
         * @throws {TypeError}
         */
        registerBeforeUpdateAccount(fn: BeforeHookFunction<UserUpdateAccount>): void;

        /**
         * Register after Hook for RPC updateAccount function.
         *
         * @param fn - The function to execute after updateAccount.
         * @throws {TypeError}
         */
        registerAfterUpdateAccount(fn: AfterHookFunction<void, UserUpdateAccount>): void;

        /**
         * Register before Hook for RPC authenticateApple function.
         *
         * @param fn - The function to execute before authenticateApple.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateApple(fn: BeforeHookFunction<AuthenticateAppleRequest>): void;

        /**
         * Register After Hook for RPC authenticateApple function.
         *
         * @param fn - The function to execute after authenticateApple.
         * @throws {TypeError}
         */
        registerAfterAuthenticateApple(fn: AfterHookFunction<Session, AuthenticateAppleRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateCustom function.
         *
         * @param fn - The function to execute before AuthenticateCustom.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateCustom(fn: BeforeHookFunction<AuthenticateCustomRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateCustom function.
         *
         * @param fn - The function to execute after AuthenticateCustom.
         * @throws {TypeError}
         */
        registerAfterAuthenticateCustom(fn: AfterHookFunction<Session, AuthenticateCustomRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateDevice function.
         *
         * @param fn - The function to execute before AuthenticateDevice.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateDevice(fn: BeforeHookFunction<AuthenticateDeviceRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateDevice function.
         *
         * @param fn - The function to execute after AuthenticateDevice.
         * @throws {TypeError}
         */
        registerAfterAuthenticateDevice(fn: AfterHookFunction<Session, AuthenticateDeviceRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateEmail function.
         *
         * @param fn - The function to execute before AuthenticateEmail.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateEmail(fn: BeforeHookFunction<AuthenticateEmailRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateEmail function.
         *
         * @param fn - The function to execute after AuthenticateEmail.
         * @throws {TypeError}
         */
        registerAfterAuthenticateEmail(fn: AfterHookFunction<Session, AuthenticateEmailRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateFacebook function.
         *
         * @param fn - The function to execute before AuthenticateFacebook.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateFacebook(fn: BeforeHookFunction<AuthenticateFacebookRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateFacebook function.
         *
         * @param fn - The function to execute after AuthenticateFacebook.
         * @throws {TypeError}
         */
        registerAfterAuthenticateFacebook(fn: AfterHookFunction<Session, AuthenticateFacebookRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateFacebookInstantGame function.
         *
         * @param fn - The function to execute before AuthenticateFacebookInstantGame.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateFacebookInstantGame(fn: BeforeHookFunction<AuthenticateFacebookInstantGameRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateFacebookInstantGame function.
         *
         * @param fn - The function to execute after AuthenticateFacebookInstantGame.
         * @throws {TypeError}
         */
        registerAfterAuthenticateFacebookInstantGame(fn: AfterHookFunction<Session, AuthenticateFacebookInstantGameRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateGameCenter function.
         *
         * @param fn - The function to execute before AuthenticateGameCenter.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateGameCenter(fn: BeforeHookFunction<AuthenticateGameCenterRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateGameCenter function.
         *
         * @param fn - The function to execute after AuthenticateGameCenter.
         * @throws {TypeError}
         */
        registerAfterAuthenticateGameCenter(fn: AfterHookFunction<Session, AuthenticateGameCenterRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateGoogle function.
         *
         * @param fn - The function to execute before AuthenticateGoogle.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateGoogle(fn: BeforeHookFunction<AuthenticateGoogleRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateGoogle function.
         *
         * @param fn - The function to execute after AuthenticateGoogle.
         * @throws {TypeError}
         */
        registerAfterAuthenticateGoogle(fn: AfterHookFunction<Session, AuthenticateGoogleRequest>): void;

        /**
         * Register before Hook for RPC AuthenticateSteam function.
         *
         * @param fn - The function to execute before AuthenticateSteam.
         * @throws {TypeError}
         */
        registerBeforeAuthenticateSteam(fn: BeforeHookFunction<AuthenticateSteamRequest>): void;

        /**
         * Register after Hook for RPC AuthenticateSteam function.
         *
         * @param fn - The function to execute after AuthenticateSteam.
         * @throws {TypeError}
         */
        registerAfterAuthenticateSteam(fn: AfterHookFunction<Session, AuthenticateSteamRequest>): void;

        /**
         * Register before Hook for RPC ChannelMessages function.
         *
         * @param fn - The function to execute before ChannelMessages.
         * @throws {TypeError}
         */
        registerBeforeListChannelMessages(fn: BeforeHookFunction<ListChannelMessagesRequest>): void;

        /**
         * Register after Hook for RPC ChannelMessages function.
         *
         * @param fn - The function to execute after ChannelMessages.
         * @throws {TypeError}
         */
        registerAfterListChannelMessages(fn: AfterHookFunction<ChannelMessageList, ListChannelMessagesRequest>): void;

        /**
         * Register before Hook for RPC BeforeListFriends function.
         *
         * @param fn - The function to execute before BeforeListFriends.
         * @throws {TypeError}
         */
        registerBeforeListFriends(fn: BeforeHookFunction<ListFriendsRequest>): void;

        /**
         * Register after Hook for RPC BeforeListFriends function.
         *
         * @param fn - The function to execute after BeforeListFriends.
         * @throws {TypeError}
         */
        registerAfterListFriends(fn: AfterHookFunction<FriendList, ListFriendsRequest>): void;

        /**
         * Register before Hook for RPC AddFriends function.
         *
         * @param fn - The function to execute before AddFriends.
         * @throws {TypeError}
         */
        registerBeforeAddFriends(fn: BeforeHookFunction<AddFriendsRequest>): void;

        /**
         * Register after Hook for RPC AddFriends function.
         *
         * @param fn - The function to execute after AddFriends.
         * @throws {TypeError}
         */
        registerAfterAddFriends(fn: AfterHookFunction<void, AddFriendsRequest>): void;

        /**
         * Register before Hook for RPC DeleteFriends function.
         *
         * @param fn - The function to execute before DeleteFriends.
         * @throws {TypeError}
         */
        registerBeforeDeleteFriends(fn: BeforeHookFunction<DeleteFriendsRequest>): void;

        /**
         * Register after Hook for RPC DeleteFriends function.
         *
         * @param fn - The function to execute after DeleteFriends.
         * @throws {TypeError}
         */
        registerAfterDeleteFriends(fn: AfterHookFunction<void, DeleteFriendsRequest>): void;

        /**
         * Register before Hook for RPC BlockFriends function.
         *
         * @param fn - The function to execute before BlockFriends.
         * @throws {TypeError}
         */
        registerBeforeBlockFriends(fn: BeforeHookFunction<BlockFriendsRequest>): void;

        /**
         * Register after Hook for RPC BlockFriends function.
         *
         * @param fn - The function to execute after BlockFriends.
         * @throws {TypeError}
         */
        registerAfterBlockFriends(fn: AfterHookFunction<void, BlockFriendsRequest>): void;

        /**
         * Register before Hook for RPC ImportFacebookFriends function.
         *
         * @param fn - The function to execute before ImportFacebookFriends.
         * @throws {TypeError}
         */
        registerBeforeImportFacebookFriends(fn: BeforeHookFunction<ImportFacebookFriendsRequest>): void;

        /**
         * Register after Hook for RPC ImportFacebookFriends function.
         *
         * @param fn - The function to execute after ImportFacebookFriends.
         * @throws {TypeError}
         */
        registerAfterImportFacebookFriends(fn: AfterHookFunction<void, ImportFacebookFriendsRequest>): void;

        /**
         * Register before Hook for RPC ImportSteamFriends function.
         *
         * @param fn - The function to execute before ImportSteamFriends.
         * @throws {TypeError}
         */
        registerBeforeImportSteamFriends(fn: BeforeHookFunction<ImportSteamFriendsRequest>): void;

        /**
         * Register after Hook for RPC ImportSteamFriends function.
         *
         * @param fn - The function to execute after ImportSteamFriends.
         * @throws {TypeError}
         */
        registerAfterImportSteamFriends(fn: AfterHookFunction<void, ImportSteamFriendsRequest>): void;

        /**
         * Register before Hook for RPC CreateGroup function.
         *
         * @param fn - The function to execute before CreateGroup.
         * @throws {TypeError}
         */
        registerBeforeCreateGroup(fn: BeforeHookFunction<CreateGroupRequest>): void;

        /**
         * Register after Hook for RPC CreateGroup function.
         *
         * @param fn - The function to execute after CreateGroup.
         * @throws {TypeError}
         */
        registerAfterCreateGroup(fn: AfterHookFunction<Group, CreateGroupRequest>): void;

        /**
         * Register before Hook for RPC UpdateGroup function.
         *
         * @param fn - The function to execute before UpdateGroup.
         * @throws {TypeError}
         */
        registerBeforeUpdateGroup(fn: BeforeHookFunction<UpdateGroupRequest>): void;

        /**
         * Register after Hook for RPC UpdateGroup function.
         *
         * @param fn - The function to execute after UpdateGroup.
         * @throws {TypeError}
         */
        registerAfterUpdateGroup(fn: AfterHookFunction<void, UpdateGroupRequest>): void;

        /**
         * Register before Hook for RPC DeleteGroup function.
         *
         * @param fn - The function to execute before DeleteGroup.
         * @throws {TypeError}
         */
        registerBeforeDeleteGroup(fn: BeforeHookFunction<DeleteGroupRequest>): void;

        /**
         * Register after Hook for RPC DeleteGroup function.
         *
         * @param fn - The function to execute after DeleteGroup.
         * @throws {TypeError}
         */
        registerAfterDeleteGroup(fn: AfterHookFunction<void, DeleteGroupRequest>): void;

        /**
         * Register before Hook for RPC JoinGroup function.
         *
         * @param fn - The function to execute before JoinGroup.
         * @throws {TypeError}
         */
        registerBeforeJoinGroup(fn: BeforeHookFunction<JoinGroupRequest>): void;

        /**
         * Register after Hook for RPC JoinGroup function.
         *
         * @param fn - The function to execute after JoinGroup.
         * @throws {TypeError}
         */
        registerAfterJoinGroup(fn: AfterHookFunction<void, JoinGroupRequest>): void;

        /**
         * Register before Hook for RPC LeaveGroup function.
         *
         * @param fn - The function to execute before LeaveGroup.
         * @throws {TypeError}
         */
        registerBeforeLeaveGroup(fn: BeforeHookFunction<LeaveGroupRequest>): void;

        /**
         * Register after Hook for RPC LeaveGroup function.
         *
         * @param fn - The function to execute after LeaveGroup.
         * @throws {TypeError}
         */
        registerAfterLeaveGroup(fn: AfterHookFunction<void, LeaveGroupRequest>): void;

        /**
         * Register before Hook for RPC AddGroupUsers function.
         *
         * @param fn - The function to execute before AddGroupUsers.
         * @throws {TypeError}
         */
        registerBeforeAddGroupUsers(fn: BeforeHookFunction<AddGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC AddGroupUsers function.
         *
         * @param fn - The function to execute after AddGroupUsers.
         * @throws {TypeError}
         */
        registerAfterAddGroupUsers(fn: AfterHookFunction<void, AddGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC BanGroupUsers function.
         *
         * @param fn - The function to execute before BanGroupUsers.
         * @throws {TypeError}
         */
        registerBeforeBanGroupUsers(fn: BeforeHookFunction<BanGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC BanGroupUsers function.
         *
         * @param fn - The function to execute after BanGroupUsers.
         * @throws {TypeError}
         */
        registerAfterBanGroupUsers(fn: AfterHookFunction<void, BanGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC KickGroupUsers function.
         *
         * @param fn - The function to execute before KickGroupUsers.
         * @throws {TypeError}
         */
        registerBeforeKickGroupUsers(fn: BeforeHookFunction<KickGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC KickGroupUsers function.
         *
         * @param fn - The function to execute after KickGroupUsers.
         * @throws {TypeError}
         */
        registerAfterKickGroupUsers(fn: AfterHookFunction<void, KickGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC PromoteGroupUsers function.
         *
         * @param fn - The function to execute before PromoteGroupUsers.
         * @throws {TypeError}
         */
        registerBeforePromoteGroupUsers(fn: BeforeHookFunction<PromoteGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC PromoteGroupUsers function.
         *
         * @param fn - The function to execute after PromoteGroupUsers.
         * @throws {TypeError}
         */
        registerAfterPromoteGroupUsers(fn: AfterHookFunction<void, PromoteGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC DemoteGroupUsers function.
         *
         * @param fn - The function to execute before DemoteGroupUsers.
         * @throws {TypeError}
         */
        registerBeforeDemoteGroupUsers(fn: BeforeHookFunction<DemoteGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC DemoteGroupUsers function.
         *
         * @param fn - The function to execute after DemoteGroupUsers.
         * @throws {TypeError}
         */
        registerAfterDemoteGroupUsers(fn: AfterHookFunction<void, DemoteGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC ListGroupUsers function.
         *
         * @param fn - The function to execute before ListGroupUsers.
         * @throws {TypeError}
         */
        registerBeforeListGroupUsers(fn: BeforeHookFunction<ListGroupUsersRequest>): void;

        /**
         * Register after Hook for RPC ListGroupUsers function.
         *
         * @param fn - The function to execute after ListGroupUsers.
         * @throws {TypeError}
         */
        registerAfterListGroupUsers(fn: AfterHookFunction<GroupUserList, ListGroupUsersRequest>): void;

        /**
         * Register before Hook for RPC ListUserGroups function.
         *
         * @param fn - The function to execute before ListUserGroups.
         * @throws {TypeError}
         */
        registerBeforeListUserGroups(fn: BeforeHookFunction<ListUserGroupsRequest>): void;

        /**
         * Register after Hook for RPC ListUserGroups function.
         *
         * @param fn - The function to execute after ListUserGroups.
         * @throws {TypeError}
         */
        registerAfterListUserGroups(fn: AfterHookFunction<UserGroupList, ListUserGroupsRequest>): void;

        /**
         * Register before Hook for RPC ListGroups function.
         *
         * @param fn - The function to execute before ListGroups.
         * @throws {TypeError}
         */
        registerBeforeListGroups(fn: BeforeHookFunction<ListGroupsRequest>): void;

        /**
         * Register after Hook for RPC ListGroups function.
         *
         * @param fn - The function to execute after ListGroups.
         * @throws {TypeError}
         */
        registerAfterListGroups(fn: AfterHookFunction<GroupList, ListGroupsRequest>): void;

        /**
         * Register before Hook for RPC DeleteLeaderboardRecord function.
         *
         * @param fn - The function to execute before DeleteLeaderboardRecord.
         * @throws {TypeError}
         */
        registerBeforeDeleteLeaderboardRecord(fn: BeforeHookFunction<DeleteLeaderboardRecordRequest>): void;

        /**
         * Register after Hook for RPC DeleteLeaderboardRecord function.
         *
         * @param fn - The function to execute after DeleteLeaderboardRecord.
         * @throws {TypeError}
         */
        registerAfterDeleteLeaderboardRecord(fn: AfterHookFunction<void, DeleteLeaderboardRecordRequest>): void;

        /**
         * Register before Hook for RPC ListLeaderboardRecords function.
         *
         * @param fn - The function to execute before ListLeaderboardRecords.
         * @throws {TypeError}
         */
        registerBeforeListLeaderboardRecords(fn: BeforeHookFunction<ListLeaderboardRecordsRequest>): void;

        /**
         * Register after Hook for RPC ListLeaderboardRecords function.
         *
         * @param fn - The function to execute after ListLeaderboardRecords.
         * @throws {TypeError}
         */
        registerAfterListLeaderboardRecords(fn: AfterHookFunction<LeaderboardRecordList, ListLeaderboardRecordsRequest>): void;

        /**
         * Register before Hook for RPC WriteLeaderboardRecord function.
         *
         * @param fn - The function to execute before WriteLeaderboardRecord.
         * @throws {TypeError}
         */
        registerBeforeWriteLeaderboardRecord(fn: BeforeHookFunction<WriteLeaderboardRecordRequest>): void;

        /**
         * Register after Hook for RPC WriteLeaderboardRecord function.
         *
         * @param fn - The function to execute after WriteLeaderboardRecord.
         * @throws {TypeError}
         */
        registerAfterWriteLeaderboardRecord(fn: AfterHookFunction<LeaderboardRecord, WriteLeaderboardRecordRequest>): void;

        /**
         * Register before Hook for RPC ListLeaderboardRecordsAroundOwner function.
         *
         * @param fn - The function to execute before ListLeaderboardRecordsAroundOwner.
         * @throws {TypeError}
         */
        registerBeforeListLeaderboardRecordsAroundOwner(fn: BeforeHookFunction<ListLeaderboardRecordsAroundOwnerRequest>): void;

        /**
         * Register after Hook for RPC ListLeaderboardRecordsAroundOwner function.
         *
         * @param fn - The function to execute after ListLeaderboardRecordsAroundOwner.
         * @throws {TypeError}
         */
        registerAfterListLeaderboardRecordsAroundOwner(fn: AfterHookFunction<LeaderboardRecordList, ListLeaderboardRecordsAroundOwnerRequest>): void;

        /**
         * Register before Hook for RPC LinkApple function.
         *
         * @param fn - The function to execute before LinkApple.
         * @throws {TypeError}
         */
        registerBeforeLinkApple(fn: BeforeHookFunction<AccountApple>): void;

        /**
         * Register after Hook for RPC LinkApple function.
         *
         * @param fn - The function to execute after LinkApple.
         * @throws {TypeError}
         */
        registerAfterLinkApple(fn: AfterHookFunction<void, AccountApple>): void;

        /**
         * Register before Hook for RPC LinkCustom function.
         *
         * @param fn - The function to execute before LinkCustom.
         * @throws {TypeError}
         */
        registerBeforeLinkCustom(fn: BeforeHookFunction<AccountCustom>): void;

        /**
         * Register after Hook for RPC LinkCustom function.
         *
         * @param fn - The function to execute after LinkCustom.
         * @throws {TypeError}
         */
        registerAfterLinkCustom(fn: AfterHookFunction<void, AccountCustom>): void;

        /**
         * Register before Hook for RPC LinkDevice function.
         *
         * @param fn - The function to execute before LinkDevice.
         * @throws {TypeError}
         */
        registerBeforeLinkDevice(fn: BeforeHookFunction<AccountDevice>): void;

        /**
         * Register after Hook for RPC LinkDevice function.
         *
         * @param fn - The function to execute after LinkDevice.
         * @throws {TypeError}
         */
        registerAfterLinkDevice(fn: AfterHookFunction<void, AccountDevice>): void;

        /**
         * Register before Hook for RPC LinkEmail function.
         *
         * @param fn - The function to execute before LinkEmail.
         * @throws {TypeError}
         */
        registerBeforeLinkEmail(fn: BeforeHookFunction<AccountEmail>): void;

        /**
         * Register after Hook for RPC LinkEmail function.
         *
         * @param fn - The function to execute after LinkEmail.
         * @throws {TypeError}
         */
        registerAfterLinkEmail(fn: AfterHookFunction<void, AccountEmail>): void;

        /**
         * Register before Hook for RPC LinkFacebook function.
         *
         * @param fn - The function to execute before LinkFacebook.
         * @throws {TypeError}
         */
        registerBeforeLinkFacebook(fn: BeforeHookFunction<LinkFacebookRequest>): void;

        /**
         * Register after Hook for RPC LinkFacebook function.
         *
         * @param fn - The function to execute after LinkFacebook.
         * @throws {TypeError}
         */
        registerAfterLinkFacebook(fn: AfterHookFunction<void, LinkFacebookRequest>): void;

        /**
         * Register before Hook for RPC LinkFacebookInstantGame function.
         *
         * @param fn - The function to execute before LinkFacebookInstantGame.
         * @throws {TypeError}
         */
        registerBeforeLinkFacebookInstantGame(fn: BeforeHookFunction<AccountFacebookInstantGame>): void;

        /**
         * Register after Hook for RPC LinkFacebookInstantGame function.
         *
         * @param fn - The function to execute after LinkFacebookInstantGame.
         * @throws {TypeError}
         */
        registerAfterLinkFacebookInstantGame(fn: AfterHookFunction<void, AccountFacebookInstantGame>): void;

        /**
         * Register before Hook for RPC LinkGameCenter function.
         *
         * @param fn - The function to execute before LinkGameCenter.
         * @throws {TypeError}
         */
        registerBeforeLinkGameCenter(fn: BeforeHookFunction<AccountGameCenter>): void;

        /**
         * Register after Hook for RPC LinkGameCenter function.
         *
         * @param fn - The function to execute after LinkGameCenter.
         * @throws {TypeError}
         */
        registerAfterLinkGameCenter(fn: AfterHookFunction<void, AccountGameCenter>): void;

        /**
         * Register before Hook for RPC LinkGoogle function.
         *
         * @param fn - The function to execute before LinkGoogle.
         * @throws {TypeError}
         */
        registerBeforeLinkGoogle(fn: BeforeHookFunction<AccountGoogle>): void;

        /**
         * Register after Hook for RPC LinkGoogle function.
         *
         * @param fn - The function to execute after LinkGoogle.
         * @throws {TypeError}
         */
        registerAfterLinkGoogle(fn: AfterHookFunction<void, AccountGoogle>): void;

        /**
         * Register before Hook for RPC LinkSteam function.
         *
         * @param fn - The function to execute before LinkSteam.
         * @throws {TypeError}
         */
        registerBeforeLinkSteam(fn: BeforeHookFunction<LinkSteamRequest>): void;

        /**
         * Register after Hook for RPC LinkSteam function.
         *
         * @param fn - The function to execute after LinkSteam.
         * @throws {TypeError}
         */
        registerAfterLinkSteam(fn: AfterHookFunction<void, LinkSteamRequest>): void;

        /**
         * Register before Hook for RPC ListMatches function.
         *
         * @param fn - The function to execute before ListMatches.
         * @throws {TypeError}
         */
        registerBeforeListMatches(fn: BeforeHookFunction<ListMatchesRequest>): void;

        /**
         * Register after Hook for RPC ListMatches function.
         *
         * @param fn - The function to execute after ListMatches.
         * @throws {TypeError}
         */
        registerAfterListMatches(fn: AfterHookFunction<MatchList, ListMatchesRequest>): void;

        /**
         * Register before Hook for RPC ListNotifications function.
         *
         * @param fn - The function to execute before ListNotifications.
         * @throws {TypeError}
         */
        registerBeforeListNotifications(fn: BeforeHookFunction<ListNotificationsRequest>): void;

        /**
         * Register after Hook for RPC ListNotifications function.
         *
         * @param fn - The function to execute after ListNotifications.
         * @throws {TypeError}
         */
        registerAfterListNotifications(fn: AfterHookFunction<NotificationList, ListNotificationsRequest>): void;

        /**
         * Register before Hook for RPC DeleteNotifications function.
         *
         * @param fn - The function to execute before DeleteNotifications.
         * @throws {TypeError}
         */
        registerBeforeDeleteNotifications(fn: BeforeHookFunction<DeleteNotificationsRequest>): void;

        /**
         * Register after Hook for RPC DeleteNotifications function.
         *
         * @param fn - The function to execute after DeleteNotifications.
         * @throws {TypeError}
         */
        registerAfterDeleteNotifications(fn: AfterHookFunction<void, DeleteNotificationsRequest>): void;

        /**
         * Register before Hook for RPC ListStorageObjects function.
         *
         * @param fn - The function to execute before ListStorageObjects.
         * @throws {TypeError}
         */
        registerBeforeListStorageObjects(fn: BeforeHookFunction<ListStorageObjectsRequest>): void;

        /**
         * Register after Hook for RPC ListStorageObjects function.
         *
         * @param fn - The function to execute after ListStorageObjects.
         * @throws {TypeError}
         */
        registerAfterListStorageObjects(fn: AfterHookFunction<StorageObjectList, ListStorageObjectsRequest>): void;

        /**
         * Register before Hook for RPC ReadStorageObjects function.
         *
         * @param fn - The function to execute before ReadStorageObjects.
         * @throws {TypeError}
         */
        registerBeforeReadStorageObjects(fn: BeforeHookFunction<ReadStorageObjectsRequest>): void;

        /**
         * Register after Hook for RPC ReadStorageObjects function.
         *
         * @param fn - The function to execute after ReadStorageObjects.
         * @throws {TypeError}
         */
        registerAfterReadStorageObjects(fn: AfterHookFunction<StorageObjects, ReadStorageObjectsRequest>): void;

        /**
         * Register before Hook for RPC WriteStorageObjects function.
         *
         * @param fn - The function to execute before WriteStorageObjects.
         * @throws {TypeError}
         */
        registerBeforeWriteStorageObjects(fn: BeforeHookFunction<WriteStorageObjectsRequest>): void;

        /**
         * Register after Hook for RPC WriteStorageObjects function.
         *
         * @param fn - The function to execute after WriteStorageObjects.
         * @throws {TypeError}
         */
        registerAfterWriteStorageObjects(fn: AfterHookFunction<StorageObjectAcks, WriteStorageObjectsRequest>): void;

        /**
         * Register before Hook for RPC DeleteStorageObjects function.
         *
         * @param fn - The function to execute before DeleteStorageObjects.
         * @throws {TypeError}
         */
        registerBeforeDeleteStorageObjects(fn: BeforeHookFunction<DeleteStorageObjectsRequest>): void;

        /**
         * Register after Hook for RPC DeleteStorageObjects function.
         *
         * @param fn - The function to execute after DeleteStorageObjects.
         * @throws {TypeError}
         */
        registerAfterDeleteStorageObjects(fn: AfterHookFunction<void, DeleteStorageObjectsRequest>): void;

        /**
         * Register before Hook for RPC JoinTournament function.
         *
         * @param fn - The function to execute before JoinTournament.
         * @throws {TypeError}
         */
        registerBeforeJoinTournament(fn: BeforeHookFunction<JoinTournamentRequest>): void;

        /**
         * Register after Hook for RPC JoinTournament function.
         *
         * @param fn - The function to execute after JoinTournament.
         * @throws {TypeError}
         */
        registerAfterJoinTournament(fn: AfterHookFunction<void, JoinTournamentRequest>): void;

        /**
         * Register before Hook for RPC ListTournamentRecords function.
         *
         * @param fn - The function to execute before ListTournamentRecords.
         * @throws {TypeError}
         */
        registerBeforeListTournamentRecords(fn: BeforeHookFunction<ListTournamentRecordsRequest>): void;

        /**
         * Register after Hook for RPC ListTournamentRecords function.
         *
         * @param fn - The function to execute after ListTournamentRecords.
         * @throws {TypeError}
         */
        registerAfterListTournamentRecords(fn: AfterHookFunction<TournamentRecordList, ListTournamentRecordsRequest>): void;

        /**
         * Register before Hook for RPC ListTournaments function.
         *
         * @param fn - The function to execute before ListTournaments.
         * @throws {TypeError}
         */
        registerBeforeListTournaments(fn: BeforeHookFunction<ListTournamentsRequest>): void;

        /**
         * Register after Hook for RPC ListTournaments function.
         *
         * @param fn - The function to execute after ListTournaments.
         * @throws {TypeError}
         */
        registerAfterListTournaments(fn: AfterHookFunction<TournamentList, ListTournamentsRequest>): void;

        /**
         * Register before Hook for RPC WriteTournamentRecord function.
         *
         * @param fn - The function to execute before WriteTournamentRecord.
         * @throws {TypeError}
         */
        registerBeforeWriteTournamentRecord(fn: BeforeHookFunction<WriteTournamentRecordRequest>): void;

        /**
         * Register after Hook for RPC WriteTournamentRecord function.
         *
         * @param fn - The function to execute after WriteTournamentRecord.
         * @throws {TypeError}
         */
        registerAfterWriteTournamentRecord(fn: AfterHookFunction<LeaderboardRecord, WriteTournamentRecordRequest>): void;

        /**
         * Register before Hook for RPC ListTournamentRecordsAroundOwner function.
         *
         * @param fn - The function to execute before ListTournamentRecordsAroundOwner.
         * @throws {TypeError}
         */
        registerBeforeListTournamentRecordsAroundOwner(fn: BeforeHookFunction<ListTournamentRecordsAroundOwnerRequest>): void;

        /**
         * Register after Hook for RPC ListTournamentRecordsAroundOwner function.
         *
         * @param fn - The function to execute after ListTournamentRecordsAroundOwner.
         * @throws {TypeError}
         */
        registerAfterListTournamentRecordsAroundOwner(fn: AfterHookFunction<LeaderboardRecordList, ListTournamentRecordsAroundOwnerRequest>): void;

        /**
         * Register before Hook for RPC UnlinkApple function.
         *
         * @param fn - The function to execute before UnlinkApple.
         * @throws {TypeError}
         */
        registerBeforeUnlinkApple(fn: BeforeHookFunction<AccountApple>): void;

        /**
         * Register after Hook for RPC UnlinkApple function.
         *
         * @param fn - The function to execute after UnlinkApple.
         * @throws {TypeError}
         */
        registerAfterUnlinkApple(fn: AfterHookFunction<void, AccountApple>): void;

        /**
         * Register before Hook for RPC UnlinkCustom function.
         *
         * @param fn - The function to execute before UnlinkCustom.
         * @throws {TypeError}
         */
        registerBeforeUnlinkCustom(fn: BeforeHookFunction<AccountCustom>): void;

        /**
         * Register after Hook for RPC UnlinkCustom function.
         *
         * @param fn - The function to execute after UnlinkCustom.
         * @throws {TypeError}
         */
        registerAfterUnlinkCustom(fn: AfterHookFunction<void, AccountCustom>): void;

        /**
         * Register before Hook for RPC UnlinkDevice function.
         *
         * @param fn - The function to execute before UnlinkDevice.
         * @throws {TypeError}
         */
        registerBeforeUnlinkDevice(fn: BeforeHookFunction<AccountDevice>): void;

        /**
         * Register after Hook for RPC UnlinkDevice function.
         *
         * @param fn - The function to execute after UnlinkDevice.
         * @throws {TypeError}
         */
        registerAfterUnlinkDevice(fn: AfterHookFunction<void, AccountDevice>): void;

        /**
         * Register before Hook for RPC UnlinkEmail function.
         *
         * @param fn - The function to execute before UnlinkEmail.
         * @throws {TypeError}
         */
        registerBeforeUnlinkEmail(fn: BeforeHookFunction<AccountEmail>): void;

        /**
         * Register after Hook for RPC UnlinkEmail function.
         *
         * @param fn - The function to execute after UnlinkEmail.
         * @throws {TypeError}
         */
        registerAfterUnlinkEmail(fn: AfterHookFunction<void, AccountEmail>): void;

        /**
         * Register before Hook for RPC UnlinkFacebook function.
         *
         * @param fn - The function to execute before UnlinkFacebook.
         * @throws {TypeError}
         */
        registerBeforeUnlinkFacebook(fn: BeforeHookFunction<AccountFacebookInstantGame>): void;

        /**
         * Register after Hook for RPC UnlinkFacebook function.
         *
         * @param fn - The function to execute after UnlinkFacebook.
         * @throws {TypeError}
         */
        registerAfterUnlinkFacebook(fn: AfterHookFunction<void, AccountFacebook>): void;

        /**
         * Register before Hook for RPC UnlinkFacebookInstantGame function.
         *
         * @param fn - The function to execute before UnlinkFacebookInstantGame.
         * @throws {TypeError}
         */
        registerBeforeUnlinkFacebookInstantGame(fn: BeforeHookFunction<AccountFacebook>): void;

        /**
         * Register after Hook for RPC UnlinkFacebookInstantGame function.
         *
         * @param fn - The function to execute after UnlinkFacebookInstantGame.
         * @throws {TypeError}
         */
        registerAfterUnlinkFacebookInstantGame(fn: AfterHookFunction<void, AccountFacebookInstantGame>): void;

        /**
         * Register before Hook for RPC UnlinkGameCenter function.
         *
         * @param fn - The function to execute before UnlinkGameCenter.
         * @throws {TypeError}
         */
        registerBeforeUnlinkGameCenter(fn: BeforeHookFunction<AccountGameCenter>): void;

        /**
         * Register after Hook for RPC UnlinkGameCenter function.
         *
         * @param fn - The function to execute after UnlinkGameCenter.
         * @throws {TypeError}
         */
        registerAfterUnlinkGameCenter(fn: AfterHookFunction<void, AccountGameCenter>): void;

        /**
         * Register before Hook for RPC UnlinkGoogle function.
         *
         * @param fn - The function to execute before UnlinkGoogle.
         * @throws {TypeError}
         */
        registerBeforeUnlinkGoogle(fn: BeforeHookFunction<AccountGoogle>): void;

        /**
         * Register after Hook for RPC UnlinkGoogle function.
         *
         * @param fn - The function to execute after UnlinkGoogle.
         * @throws {TypeError}
         */
        registerAfterUnlinkGoogle(fn: AfterHookFunction<void, AccountGoogle>): void;

        /**
         * Register before Hook for RPC UnlinkSteam function.
         *
         * @param fn - The function to execute before UnlinkSteam.
         * @throws {TypeError}
         */
        registerBeforeUnlinkSteam(fn: BeforeHookFunction<AccountSteam>): void;

        /**
         * Register after Hook for RPC UnlinkSteam function.
         *
         * @param fn - The function to execute after UnlinkSteam.
         * @throws {TypeError}
         */
        registerAfterUnlinkSteam(fn: AfterHookFunction<void, AccountSteam>): void;

        /**
         * Register before Hook for RPC GetUsers function.
         *
         * @param fn - The function to execute before GetUsers.
         * @throws {TypeError}
         */
        registerBeforeGetUsers(fn: BeforeHookFunction<GetUsersRequest>): void;

        /**
         * Register after Hook for RPC GetUsers function.
         *
         * @param fn - The function to execute after GetUsers.
         * @throws {TypeError}
         */
        registerAfterGetUsers(fn: AfterHookFunction<Users, GetUsersRequest>): void;

        /**
         * Register before Hook for RPC ValidatePurchaseApple function.
         *
         * @param fn - The function to execute before ValidatePurchaseApple.
         * @throws {TypeError}
         */
        registerBeforeValidatePurchaseApple(fn: BeforeHookFunction<ValidatePurchaseAppleRequest>): void;

        /**
         * Register after Hook for RPC ValidatePurchaseApple function.
         *
         * @param fn - The function to execute after ValidatePurchaseApple.
         * @throws {TypeError}
         */
         registerAfterValidatePurchaseApple(fn: AfterHookFunction<ValidatePurchaseResponse, ValidatePurchaseAppleRequest>): void;

        /**
         * Register before Hook for RPC ValidateSubscriptionApple function.
         *
         * @param fn - The function to execute before ValidatePurchaseApple.
         * @throws {TypeError}
         */
        registerBeforeValidateSubscriptionApple(fn: BeforeHookFunction<ValidateSubscriptionAppleRequest>): void;

        /**
         * Register after Hook for RPC ValidatePurchaseApple function.
         *
         * @param fn - The function to execute after ValidatePurchaseApple.
         * @throws {TypeError}
         */
        registerAfterValidateSubscriptionApple(fn: AfterHookFunction<ValidateSubscriptionResponse, ValidateSubscriptionAppleRequest>): void;



        /**
         * Register before Hook for RPC ValidatePurchaseGoogle function.
         *
         * @param fn - The function to execute before ValidatePurchaseGoogle.
         * @throws {TypeError}
         */
        registerBeforeValidatePurchaseGoogle(fn: BeforeHookFunction<ValidatePurchaseGoogleRequest>): void;

        /**
         * Register after Hook for RPC ValidatePurchaseGoogle function.
         *
         * @param fn - The function to execute after ValidatePurchaseGoogle.
         * @throws {TypeError}
         */
         registerAfterValidatePurchaseGoogle(fn: AfterHookFunction<ValidatePurchaseResponse, ValidatePurchaseGoogleRequest>): void;

        /**
         * Register before Hook for RPC ValidatePurchaseGoogle function.
         *
         * @param fn - The function to execute before ValidatePurchaseGoogle.
         * @throws {TypeError}
         */
        registerBeforeValidatePurchaseGoogle(fn: BeforeHookFunction<ValidateSubscriptionGoogleRequest>): void;

        /**
         * Register after Hook for RPC ValidatePurchaseGoogle function.
         *
         * @param fn - The function to execute after ValidatePurchaseGoogle.
         * @throws {TypeError}
         */
        registerAfterValidatePurchaseGoogle(fn: AfterHookFunction<ValidateSubscriptionResponse, ValidateSubscriptionGoogleRequest>): void;

        /**
         * Register before Hook for RPC ValidatePurchaseHuawei function.
         *
         * @param fn - The function to execute before ValidatePurchaseHuawei.
         * @throws {TypeError}
         */
        registerBeforeValidatePurchaseHuawei(fn: BeforeHookFunction<ValidatePurchaseHuaweiRequest>): void;

        /**
         * Register after Hook for RPC ValidatePurchaseHuawei function.
         *
         * @param fn - The function to execute after ValidatePurchaseHuawei.
         * @throws {TypeError}
         */
         registerAfterValidatePurchaseHuawei(fn: AfterHookFunction<ValidatePurchaseResponse, ValidatePurchaseHuaweiRequest>): void;

        /**
         * Register before Hook for RPC Event function.
         *
         * @param fn - The function to execute before Event.
         * @throws {TypeError}
         */
        registerBeforeEvent(fn: BeforeHookFunction<Event>): void;

        /**
         * Register after Hook for RPC Event function.
         *
         * @param fn - The function to execute after Event.
         * @throws {TypeError}
         */
        registerAfterEvent(fn: AfterHookFunction<void, Event>): void;

        /**
         * Register a match handler.
         *
         * @param name - Identifier of the match handler.
         * @param functions - Object containing the match handler functions.
         */
        registerMatch<State = MatchState>(name: string, functions: MatchHandler<State>): void;

        /**
         * Register matchmaker matched handler.
         *
         * @param fn - The function to execute after a matchmaker match.
         */
        registerMatchmakerMatched(fn: MatchmakerMatchedFunction): void;

        /**
         * Register tournament end handler.
         *
         * @param fn - The function to execute after a tournament ends.
         */
        registerTournamentEnd(fn: TournamentEndFunction): void;

        /**
         * Register tournament reset handler.
         *
         * @param fn - The function to execute after a tournament resets.
         */
        registerTournamentReset(fn: TournamentResetFunction): void;

        /**
         * Register leaderboard reset handler.
         *
         * @param fn - The function to execute after a leaderboard resets.
         */
        registerLeaderboardReset(fn: LeaderboardResetFunction): void;
    }

    /**
     * A structured logger to output messages to the game server.
     */
    export interface Logger {
        /**
         * Log a message with optional formatted arguments at INFO level.
         *
         * @param format - A string with optional formatting placeholders.
         * @param args - The placeholder arguments for the formatted string.
         * @returns The formatted string logged to the server.
         */
        info(format: string, ...args: any[]): string;

        /**
         * Log a message with optional formatted arguments at WARN level.
         *
         * @param format - A string with optional formatting placeholders.
         * @param args - The placeholder arguments for the formatted string.
         * @returns The formatted string logged to the server.
         */
        warn(format: string, ...args: any[]): string;

        /**
         * Log a message with optional formatted arguments at ERROR level.
         *
         * @param format - A string with optional formatting placeholders.
         * @param args - The placeholder arguments for the formatted string.
         * @returns The formatted string logged to the server.
         */
        error(format: string, ...args: any[]): string;

        /**
         * Log a message with optional formatted arguments at DEBUG level.
         *
         * @param format - A string with optional formatting placeholders.
         * @param args - The placeholder arguments for the formatted string.
         * @returns The formatted string logged to the server.
         */
        debug(format: string, ...args: any[]): string;

        /**
         * A logger with the key/value pair added as the fields logged alongside the message.
         *
         * @param key - The key name for the field.
         * @param value - The value for the field.
         * @returns The modified logger with the new structured fields.
         */
        withField(key: string, value: string): Logger;

        /**
         * A new logger with the key/value pairs added as fields logged alongside the message.
         *
         * @param pairs - The pairs of key/value fields to add.
         * @returns The modified logger with the new structured fields.
         */
        withFields(pairs: {[key: string]: string}): Logger;

        /**
         * The fields associated with this logger.
         *
         * @returns The map of fields in the logger.
         */
        getFields(): {[key: string]: string};
    }

    /**
     * Request method type
     */
    type RequestMethod = "get" | "post" | "put" | "patch" | "head"

    /**
     * HTTP Response type
     */
    export interface HttpResponse {
        /**
         * Http Response status code.
         */
        code: number;
        /**
         * Http Response headers.
         */
        headers: string[];
        /**
         * Http Response body.
         */
        body: string;
    }

    /**
     * Object returned on successful user authentication
     */
    export interface AuthResult {
        /**
         * Authenticated User ID.
         */
        userId: string;
        /**
         * Authenticated Username.
         */
        username: string;
        /**
         * New user created
         */
        created: boolean;
    }

    /**
     * Object returned on authentication token generation
     */
    export interface TokenGenerateResult {
        /**
         * Authentication token
         */
        token: string;
        /**
         * Token expire - Unix epoch
         */
        exp: number;
    }

    /**
     * Account device object
     */
    export interface AccountDevice {
        id: string
        vars?: SessionVars
    }

    type Wallet = {[key: string]: number}

    /**
     * Account object
     */
    export interface Account {
        user: User
        wallet: Wallet
        email: string
        devices: AccountDevice[]
        customId: string
        verifyTime: number
        disableTime: number
    }

    /**
     * User object
     */
    export interface User {
        userId: string;
        username: string;
        displayName: string;
        avatarUrl: string;
        langTag: string;
        location: string;
        timezone: string;
        appleId: string;
        facebookId: string;
        facebookInstantGameId: string;
        googleId: string;
        gamecenterId: string;
        steamId: string;
        online: boolean;
        edgeCount: number;
        createTime: number;
        updateTime: number;
        metadata: {[key: string]: any};
    }

    /**
     * User update account object
     */
    export interface UserUpdateAccount {
        userId: string;
        username?: string;
        displayName?: string;
        avatarUrl?: string;
        langTag?: string;
        location?: string;
        timezone?: string;
        metadata?: {[key: string]: any};
    }

    /**
     * Stream object
     */
    export interface Stream {
        mode?: number;
        subject?: string;
        subcontext?: string;
        label?: string;
    }

    /**
     * Presence object
     */
    export interface Presence {
        userId: string;
        sessionId: string;
        username: string;
        node: string;
        status?: string;
        hidden?: boolean;
        persistence?: boolean;
        reason?: PresenceReason;
    }

    /**
     * Match Object
     */
    export interface Match {
        matchId: string;
        authoritative: boolean;
        size: number;
        label: string;
    }

    /**
     * Notification Object
     */
    export interface Notification {
        code: number;
        content: {[key: string]: any};
        persistent: boolean;
        senderId: string;
        subject: string;
        userId: string;
    }

    export interface NotificationRequest {
        code: number;
        content: {[key: string]: any};
        persistent?: boolean;
        senderId?: string | null;
        subject: string;
        userId: string;
    }

    export interface NotificationList {
        notifications?: Notification[];
        cacheableCursor?: string;
    }

    /**
     * Wallet Update
     */
    export interface WalletUpdate {
        userId: string;
        changeset: {[key: string]: number};
        metadata?: {[key: string]: any};
    }

    /**
     * Wallet Update Result
     */
    export interface WalletUpdateResult {
        // The wallet values after the update.
        updated: {[key: string]: number};
        // The wallet value prior to the update.
        previous: {[key: string]: number};
    }

    /**
     * Wallet Ledger Update Result
     */
    export interface WalletLedgerResult {
        id: string;
        userId: string;
        createTime: number;
        updateTime: number;
        changeset: {[key: string]: number};
        metadata: {[key: string]: any};
    }

    /**
     * Storage Object
     */
    export interface StorageObject {
        key: string;
        collection: string;
        userId: string;
        version: string;
        permissionRead: ReadPermissionValues;
        permissionWrite: WritePermissionValues;
        createTime: number;
        updateTime: number;
        value: {[key: string]: any};
    }

    /**
     * Storage Read Request
     */
    export interface StorageReadRequest {
        key: string;
        collection: string;
        userId: string;
    }

    /**
     * Storage Write Request
     */
    export interface StorageWriteRequest {
        key: string;
        collection: string;
        userId: string | undefined;
        value: {[key: string]: any};
        version?: string;
        permissionRead?: ReadPermissionValues;
        permissionWrite?: WritePermissionValues;
    }

    /**
     * Storage Write Ack
     */
    export interface StorageWriteAck {
        key: string;
        collection: string;
        userId: string;
        version: string;
    }

    /**
     * A list of Write Acks
     */
    export interface StorageObjectAcks {
        acks: StorageWriteAck[];
    }

    /**
     * Storage Delete Request
     */
    export interface StorageDeleteRequest {
        key: string;
        collection: string;
        userId: string;
        version?: string;
    }

    /**
     * Leaderboard Entry
     */
    export interface Leaderboard {
        id: string;
        title: string;
        description: string;
        category: number;
        authoritative: boolean;
        sortOrder: SortOrder;
        operator: Operator;
        prevReset: number;
        nextReset: number;
        metadata: {[key: string]: any};
        createTime: number;
    }

    /**
     * Leaderboard Entry
     */
    export interface LeaderboardRecord {
        leaderboardId: string;
        ownerId: string;
        username: string;
        score: number;
        subscore: number;
        numScore: number;
        metadata: {[key: string]: any};
        createTime: number;
        updateTime: number;
        expiryTime: number;
        rank: number;
    }

    /**
     * Tournament Entry
     */
    export interface Tournament {
        id: string;
        title: string;
        description: string;
        category: number;
        sortOrder: SortOrder;
        size: number;
        maxSize: number;
        maxNumScore: number;
        duration: number;
        startActive: number;
        endActive: number;
        canEnter: boolean;
        nextReset: string;
        metadata: {[key: string]: any};
        createTime: number;
        startTime: number;
        endTime: number;
    }

    /**
     * Group Entry
     */
    export interface Group {
        id: string;
        creatorId: string;
        name: string;
        description: string;
        avatarUrl: string;
        langTag: string;
        open: boolean;
        edgeCount: number;
        maxCount: number;
        createTime: number;
        updateTime: number;
        metadata: {[key: string]: any};
    }

    export interface UserGroupList {
        userGroups?: UserGroupListUserGroup[]
        cursor?: string
      }

    export interface UserGroupListUserGroup {
        group?: Group
        state?: number
    }

    export interface GroupList {
        groups?: Group[]
        cursor?: string
    }

    const enum SortOrder {
        ASCENDING = 'asc',
        DESCENDING = 'desc',
    }

    const enum Operator {
        BEST = 'best',
        SET = 'set',
        INCREMENTAL = 'incr',
    }

    const enum OverrideOperator {
        BEST = 'best',
        SET = 'set',
        INCREMENTAL = 'incr',
        DECREMENTAL = 'decr',
    }

    /**
     * Envelope for realtime message hooks
     */
    type Envelope = EnvelopeChannel | EnvelopeChannelJoin | EnvelopeChannelLeave | EnvelopeChannelMessageSend | EnvelopeChannelMessageUpdate | EnvelopeChannelMessageRemove | EnvelopeMatchCreateMessage | EnvelopeMatchDataSend | EnvelopeMatchJoin | EnvelopeMatchLeave | EnvelopeMatchmakerAdd | EnvelopeMatchmakerRemove | EnvelopeStatusFollow | EnvelopeStatusUnfollow | EnvelopeStatusUpdate | EnvelopePing | EnvelopePong

    export interface Channel {
        id?: string,
        presences?: Presence[],
        self?: Presence,
        roomName?: string,
        groupId?: string,
        userIdOne?: string, // For DM messages only
        userIdTwo?: string, // For DM messages only
    }

    export interface EnvelopeChannel {
        channel: Channel,
    }

    export interface ChannelJoin {
        target?: string,
        type?: number,
        persistence?: boolean,
        hidden?: boolean,
    }

    export interface EnvelopeChannelJoin {
        channelJoin: ChannelJoin,
    }

    export interface ChannelLeave {
        channelId: string
    }

    export interface EnvelopeChannelLeave {
        channelLeave: ChannelLeave
    }

    export interface ChannelMessageSend {
        channelId: string
        content: string
    }

    export interface EnvelopeChannelMessageSend {
        channelMessageSend: ChannelMessageSend
    }

    export interface ChannelMessageUpdate {
        channelId: string
        messageId: string
        content: string
    }

    export interface EnvelopeChannelMessageUpdate {
        channelMessageUpdate: ChannelMessageUpdate
    }

    export interface ChannelMessageRemove {
        channelId: string
        messageId: string
    }

    export interface EnvelopeChannelMessageRemove {
        channelMessageRemove: ChannelMessageRemove
    }

    export interface EnvelopeMatchCreateMessage {
        matchCreate: {}
    }

    export interface MatchDataMessageSend {
        matchId: string
        opCode: string
        data?: string
        presences?: Presence[]
        reliable?: boolean
    }

    export interface EnvelopeMatchDataSend {
        matchDataSend: MatchDataMessageSend
    }

    export interface MatchJoinMessage {
        id: string
        metadata: {[key: string]: string}
    }

    export interface EnvelopeMatchJoin {
        matchJoin: MatchJoinMessage
    }

    export interface MatchLeaveMessage {
        matchId: string
    }

    export interface EnvelopeMatchLeave {
        matchLeave: MatchLeaveMessage
    }

    export interface MatchmakerAddMessage {
        minCount: number
        maxCount: number
        query: string
        stringProperties: {[key: string]: string}
        numericProperties: {[key: string]: number}
        countMultiple: number
    }

    export interface EnvelopeMatchmakerAdd {
        matchmakerAdd: MatchmakerAddMessage
    }

    export interface MatchmakerRemoveMessage {
        ticket: string
    }

    export interface EnvelopeMatchmakerRemove {
        matchmakerRemove: MatchmakerRemoveMessage
    }

    export interface StatusFollowMessage {
        userIds: string[]
        usernames: string[]
    }

    export interface EnvelopeStatusFollow {
        statusFollow: StatusFollowMessage
    }

    export interface StatusUnfollowMessage {
        userIds: string[]
    }

    export interface EnvelopeStatusUnfollow {
        statusUnfollow: StatusUnfollowMessage
    }

    export interface StatusUpdateMessage {
        status?: string
    }

    export interface EnvelopeStatusUpdate {
        statusUpdate: StatusUpdateMessage
    }

    export interface EnvelopePing {
        ping: {}
    }

    export interface EnvelopePong {
        pong: {}
    }

    export interface SqlExecResult {
        rowsAffected: number
    }

    type SqlQueryResult = {[column: string]: any}[]

    export interface WalletLedgerList {
        items: WalletLedgerResult[]
        cursor?: string
    }

    export interface ValidatePurchaseAppleRequest {
        receipt: string
    }

    export interface ValidateSubscriptionAppleRequest {
        receipt: string
    }

    export interface ValidatePurchaseGoogleRequest {
        purchase: string
    }

    export interface ValidateSubscriptionGoogleRequest {
        receipt: string
    }

    export interface ValidatePurchaseHuaweiRequest {
        purchase: string
        signature: string
    }

    export interface ValidatePurchaseResponse {
        validatedPurchases?: ValidatedPurchase[]
    }

    export interface ValidateSubscriptionResponse {
        validatedSubscription: ValidatedSubscription
    }

    export interface ValidatedPurchaseOwner {
        validatedPurchase: ValidatedPurchase
        userId: string
    }

    export interface ValidatedSubscriptionOwner {
      validatedSubscription: ValidatedSubscription
      userId: string
    }

    export type ValidatedPurchaseStore = "APPLE_APP_STORE" | "GOOGLE_PLAY_STORE" | "HUAWEI_APP_GALLERY"

    export type ValidatedPurchaseEnvironment = "UNKNOWN" | "SANDBOX" | "PRODUCTION"

    export interface ValidatedPurchase {
        productId: string
        transactionId: string
        store: ValidatedPurchaseStore
        purchaseTime: number
        createTime: number
        updateTime: number
        providerResponse: string
        environment: ValidatedPurchaseEnvironment
        seenBefore: boolean
    }

    export interface ValidatedSubscription {
        productId: string
        originalTransactionId: string
        store: ValidatedPurchaseStore
        purchaseTime: number
        createTime: number
        updateTime: number
        environment: ValidatedPurchaseEnvironment
        expiryTime: string
        active: boolean
    }

    export interface ValidatedPurchaseList {
        validatedPurchases?: ValidatedPurchase[]
        cursor?: string
        prevCursor?: string
    }

    export interface ValidatedSubscriptionList {
        validatedSubscription?: ValidatedSubscription
        cursor?: string
        prevCursor?: string
    }

    export interface ChannelMessageSendAck {
        channelId: string
        messageId: string
        code: number
        username: string
        createTime: number
        updateTime: number
        persistent: boolean
    }

    const enum PresenceReason {
        PresenceReasonUnknown = 0,
        PresenceReasonJoin = 1,
        PresenceReasonUpdate = 2,
        PresenceReasonLeave = 3,
        PresenceReasonDisconnect = 4,
    }

    const enum ChanType {
        Room = 1,
        DirectMessage = 2,
        Group = 3,
    }

    /**
     * The server APIs available in the game server.
     */
    export interface Nakama {
        /**
         * Convert binary data to string.
         *
         * @param data - Data to convert to string.
         * @throws {TypeError}
         */
         binaryToString(data: ArrayBuffer): string;

        /**
         * Convert a string to binary data.
         *
         * @param str - String to convert to binary data.
         * @throws {TypeError}
         */
         stringToBinary(str: string): ArrayBuffer;

        /**
         * Emit an event to be processed.
         *
         * @param eventName - A string with the event name.
         * @param properties - A map of properties to send in the event.
         * @param timestamp - (optional) Timestamp of the event as a Unix epoch.
         * @param external - (optional) External (client side) generated event.
         * @throws {TypeError}
         */
        event(eventName: string, properties: {[key: string]: string}, timestamp?: number, external?: boolean): void;

        /**
         * Add a custom metrics counter.
         *
         * @param name - The name of the custom metrics counter.
         * @param tags - The metrics tags associated with this counter.
         * @param delta - An integer value to update this metric with.
         * @throws {TypeError}
         */
        metricsCounterAdd(name: string, tags: {[key: string]: string}, delta: number): void;

        /**
         * Add a custom metrics gauge.
         *
         * @param name - The name of the custom metrics gauge.
         * @param tags - The metrics tags associated with this gauge.
         * @param value - A value to update this metric with.
         * @throws {TypeError}
         */
        metricsGaugeSet(name: string, tags: {[key: string]: string}, value: number): void;


        /**
         * Add a custom metrics timer.
         *
         * @param name - The name of the custom metrics timer.
         * @param tags - The metrics tags associated with this timer.
         * @param value - An integer value to update this metric with (in nanoseconds).
         * @throws {TypeError}
         */
        metricsTimerRecord(name: string, tags: {[key: string]: string}, value: number): void;

        /**
         * Generate a new UUID v4.
         *
         * @returns UUID v4
         *
         */
        uuidv4(): string

        /**
         * Execute an SQL query to the Nakama database.
         *
         * @param sqlQuery - SQL Query string.
         * @param arguments - Opt. List of arguments to map to the query placeholders.
         * @returns the number of affected rows.
         * @throws {TypeError, GoError}
         */
        sqlExec(sqlQuery: string, args?: any[]): SqlExecResult;

        /**
         * Get the results of an SQL query to the Nakama database.
         *
         * @param sqlQuery - SQL Query string.
         * @param arguments - List of arguments to map to the query placeholders.
         * @returns an array of the returned query rows, each one containing an object whose keys map a column to the row value.
         * @throws {TypeError, GoError}
         */
        sqlQuery(sqlQuery: string, args?: any[]): SqlQueryResult;

        /**
         * Http Request
         *
         * @param url - Request target URL.
         * @param method - Http method.
         * @param headers - Http request headers.
         * @param body - Http request body.
         * @param timeout - Http Request timeout in ms.
         * @returns Http response
         * @throws {TypeError, GoError}
         */
        httpRequest(url: string, method: RequestMethod, headers?: {[header: string]: string}, body?: string, timeout?: number): HttpResponse

        /**
         * Base 64 Encode
         *
         * @param string - Input to encode.
         * @returns Base 64 encoded string.
         *
         * @throws {TypeError}
         */
        base64Encode(s: string, padding?: boolean): string;

        /**
         * Base 64 Decode
         *
         * @param string - Input to decode.
         * @returns Decoded string.
         * @throws {TypeError, GoError}
         */
        base64Decode(s: string, padding?: boolean): string;

        /**
         * Base 64 URL Encode
         *
         * @param string - Input to encode.
         * @returns URL safe base 64 encoded string.
         * @throws {TypeError}
         */
        base64UrlEncode(s: string, padding?: boolean): string;

        /**
         * Base 64 URL Decode
         *
         * @param string - Input to decode.
         * @returns Decoded string.
         * @throws {TypeError, GoError}
         */
        base64UrlDecode(s: string, padding?: boolean): string;

        /**
         * Base 16 Encode
         *
         * @param string - Input to encode.
         * @returns URL safe base 64 encoded string.
         * @throws {TypeError}
         */
        base16Encode(s: string, padding?: boolean): string;

        /**
         * Base 16 Decode
         *
         * @param string - Input to decode.
         * @returns Decoded string.
         * @throws {TypeError, GoError}
         */
        base16Decode(s: string, padding?: boolean): string;

        /**
         * Generate a JWT token
         *
         * @param algorithm - JWT signing algorithm.
         * @param signingKey - Signing key.
         * @param claims - JWT claims.
         * @returns signed JWT token.
         * @throws {TypeError, GoError}
         */
        jwtGenerate(s: 'HS256' | 'RS256', signingKey: string, claims: {[key: string]: string | number | boolean}): string;

        /**
         * AES 128 bit block size encrypt
         *
         * @param input - String to encrypt.
         * @param key - Encryption key.
         * @returns cipher text base64 encoded.
         * @throws {TypeError, GoError}
         */
        aes128Encrypt(input: string, key: string): string;

        /**
         * AES 128 bit block size decrypt
         *
         * @param input - String to decrypt.
         * @param key - Encryption key.
         * @returns clear text.
         * @throws {TypeError, GoError}
         */
        aes128Decrypt(input: string, key: string): string;

        /**
         * AES 256 bit block size encrypt
         *
         * @param input - String to encrypt.
         * @param key - Encryption key.
         * @returns cipher text base64 encoded.
         * @throws {TypeError, GoError}
         */
        aes256Encrypt(input: string, key: string): string;

        /**
         * AES 256 bit block size decrypt
         *
         * @param input - String to decrypt.
         * @param key - Encryption key.
         * @returns clear text.
         * @throws {TypeError, GoError}
         */
        aes256Decrypt(input: string, key: string): string;

        /**
         * MD5 Hash of the input
         *
         * @param input - String to hash.
         * @returns md5 Hash.
         * @throws {TypeError}
         */
        md5Hash(input: string): string;

        /**
         * SHA256 Hash of the input
         *
         * @param input - String to hash.
         * @returns sha256 Hash.
         * @throws {TypeError}
         */
        sha256Hash(input: string): string;

        /**
         * RSA SHA256 Hash of the input
         *
         * @param input - String to hash.
         * @param key - RSA private key.
         * @returns sha256 Hash.
         * @throws {TypeError, GoError}
         */
        rsaSha256Hash(input: string, key: string): string;

        /**
         * HMAC SHA256 of the input
         *
         * @param input - String to hash.
         * @param key - secret key.
         * @returns HMAC SHA256.
         * @throws {TypeError, GoError}
         */
        hmacSha256Hash(input: string, key: string): string;

        /**
         * BCrypt hash of a password
         *
         * @param password - password to hash.
         * @returns password bcrypt hash.
         * @throws {TypeError, GoError}
         */
        bcryptHash(password: string): string;

        /**
         * Compare BCrypt password hash with password for a match.
         *
         * @param password - plaintext password.
         * @param hash - hashed password.
         * @returns true if hashed password and plaintext password match, false otherwise.
         * @throws {TypeError, GoError}
         */
        bcryptCompare(hash: string, password: string): boolean;

        /**
         * Authenticate with Apple.
         *
         * @param token - Apple token.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateApple(token: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using a custom identifier.
         *
         * @param id - custom identifier.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateCustom(id: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using a device identifier.
         *
         * @param id - device identifier.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateDevice(id: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using email.
         *
         * @param email - account email.
         * @param password - account password.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateEmail(email: string, password: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using Facebook account.
         *
         * @param token - Facebook token.
         * @param importFriends - import FB account friends.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateFacebook(token: string, importFriends?: boolean, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using Facebook Instant Game.
         *
         * @param signedPlayerInfo - Facebook Instant Game signed player info.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateFacebookInstantGame(signedPlayerInfo: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate using Apple Game center.
         *
         * @param playerId - Game center player ID.
         * @param bundleId - Game center bundle ID.
         * @param ts - Timestamp.
         * @param salt - Salt.
         * @param signature - Signature.
         * @param publicKeyURL - Public Key URL.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateGameCenter(
            playerId: string,
            bundleId: string,
            ts: number,
            salt: string,
            signature: string,
            publicKeyURL: string,
            username?: string,
            create?: boolean,
        ): AuthResult;

        /**
         * Authenticate with Google account.
         *
         * @param token - Google token.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateGoogle(token: string, username?: string, create?: boolean): AuthResult;

        /**
         * Authenticate with Steam account.
         *
         * @param token - Steam token.
         * @param username - username. If not provided a random username will be generated.
         * @param create - create user if not exists, defaults to true
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateSteam(token: string, username?: string, create?: boolean): AuthResult;

        /**
         * Generate authentication token.
         *
         * @param userId - User ID.
         * @param exp - Token expiration, Unix epoch.
         * @param vars - Arbitrary metadata.
         * @returns Object with authenticated user data.
         * @throws {TypeError, GoError}
         */
        authenticateTokenGenerate(userId: string, exp: number, vars: {[key: string]: string}): TokenGenerateResult;

        /**
         * Get account data by id.
         *
         * @param userId - User ID.
         * @returns Object with account data.
         * @throws {TypeError, GoError}
         */
        accountGetId(userId: string): Account

        /**
         * Get accounts data by ids.
         *
         * @param userIds - User IDs.
         * @returns Array containing accounts data.
         * @throws {TypeError, GoError}
         */
        accountsGetId(userIds: string[]): Account[]

        /**
         * Update user account.
         *
         * @param userId - User ID for which the information is to be updated.
         * @param username - Username to be updated. Use null or undefined to not update this field.
         * @param displayName - Display name to be updated. Use null or undefined to not update this field.
         * @param timezone - Timezone to be updated. Use null or undefined to not update this field.
         * @param location - Location to be updated. Use null or undefined to not update this field.
         * @param language - Language to be updated. Use null or undefined to not update this field.
         * @param avatar - User's avatar URL. Use null or undefined to not update this field.
         * @param metadata - Metadata to update. Use null or undefined not to update this field.
         * @throws {TypeError, GoError}
         */
        accountUpdateId(userId: string, username?: string | null, displayName?: string | null, timezone?: string | null, location?: string | null, language?: string | null, avatar?: string | null, metadata?: {[key: string]: any} | null): void;

        /**
         * Delete user account
         *
         * @param userId - Target account.
         * @throws {TypeError, GoError}
         */
        accountDeleteId(userId: string): void;

        /**
         * Export user account data to JSON encoded string
         *
         * @param userId - Target account.
         * @throws {TypeError, GoError}
         */
        accountExportId(userId: string): string;

        /**
         * Get user data by ids.
         *
         * @param userIds - User IDs. Pass null to fetch by facebookIds only.
         * @param facebookIds - Facebook IDs.
         * @throws {TypeError, GoError}
         */
        usersGetId(userIds: string[], facebookIds?: string[]): User[]

        /**
         * Get user data by usernames.
         *
         * @param usernames - Usernames.
         * @throws {TypeError, GoError}
         */
        usersGetUsername(usernames: string[]): User[]

        /**
         * Get user data for a given number of random users.
         *
         * @param count - Number of users to retrieve.
         * @throws {TypeError, GoError}
         */
        usersGetRandom(count: number): User[]

        /**
         * Ban a group of users by id.
         *
         * @param userIds - User IDs.
         * @throws {TypeError, GoError}
         */
        usersBanId(userIds: string[]): void;

        /**
         * Unban a group of users by id.
         *
         * @param userIds - User IDs.
         * @throws {TypeError, GoError}
         */
        usersUnbanId(userIds: string[]): void;

        /**
         * Link an account to Apple sign in.
         *
         * @param userId - User ID.
         * @param token - Apple sign in token.
         * @throws {TypeError, GoError}
         */
        linkApple(userId: string, token: string): void;

        /**
         * Link an account to a customID.
         *
         * @param userId - User ID.
         * @param customID - Custom ID.
         * @throws {TypeError, GoError}
         */
        linkCustom(userId: string, customID: string): void;

        /**
         * Link account to a custom device.
         *
         * @param userId - User ID.
         * @param deviceID - Device ID.
         * @throws {TypeError, GoError}
         */
        linkDevice(userId: string, deviceID: string): void;

        /**
         * Link account to username and password.
         *
         * @param userId - User ID.
         * @param email - Email.
         * @param password - Password.
         * @throws {TypeError, GoError}
         */
        linkEmail(userId: string, email: string, password: string): void;

        /**
         * Link account to Facebook.
         *
         * @param userId - User ID.
         * @param username - Username.
         * @param token - Facebook Token.
         * @param importFriends - Import Facebook Friends. Defaults to true.
         * @throws {TypeError, GoError}
         */
        linkFacebook(userId: string, username: string, token: string, importFriends?: boolean): void;

        /**
         * Link account to Facebook Instant Games.
         *
         * @param userId - User ID.
         * @param signedPlayerInfo - Signed player info.
         * @throws {TypeError, GoError}
         */
        linkFacebookInstantGame(userId: string, signedPlayerInfo: string): void;

        /**
         * Link account to Apple Game Center.
         *
         * @param userId - User ID.
         * @param playerId - Game center player ID.
         * @param bundleId - Game center bundle ID.
         * @param ts - Timestamp.
         * @param salt - Salt.
         * @param signature - Signature.
         * @param publicKeyURL - Public Key URL.
         * @throws {TypeError, GoError}
         */
        linkGameCenter(
            userId: string,
            playerId: string,
            bundleId: string,
            ts: number,
            salt: string,
            signature: string,
            publicKeyURL: string,
        ): void;

        /**
         * Link account to Google.
         *
         * @param userId - User ID.
         * @param token - Google Token.
         * @throws {TypeError, GoError}
         */
        linkGoogle(userId: string, token: string): void;

        /**
         * Link account to Steam.
         *
         * @param userId - User ID.
         * @param username - Username.
         * @param token - Steam Token.
         * @param importFriends - Import Steam Friends. Defaults to true.
         * @throws {TypeError, GoError}
         */
        linkSteam(userId: string, username: string, token: string, importFriends: boolean): void;

        /**
         * Unlink Apple sign in from an account.
         *
         * @param userId - User ID.
         * @param token - Apple sign in token.
         * @throws {TypeError, GoError}
         */
        unlinkApple(userId: string, token: string): void;

        /**
         * Unlink a customID from an account.
         *
         * @param userId - User ID.
         * @param customID - Custom ID.
         * @throws {TypeError, GoError}
         */
        unlinkCustom(userId: string, customID: string): void;

        /**
         * Unlink a custom device from an account.
         *
         * @param userId - User ID.
         * @param deviceID - Device ID.
         * @throws {TypeError, GoError}
         */
        unlinkDevice(userId: string, deviceID: string): void;

        /**
         * Unlink username and password from an account.
         *
         * @param userId - User ID.
         * @param email - Email.
         * @throws {TypeError, GoError}
         */
        unlinkEmail(userId: string, email: string): void;

        /**
         * Unlink Facebook from an account.
         *
         * @param userId - User ID.
         * @param token - Password.
         * @throws {TypeError, GoError}
         */
        unlinkFacebook(userId: string, token: string): void;

        /**
         * Unlink Facebook Instant Games from an account.
         *
         * @param userId - User ID.
         * @param signedPlayerInfo - Signed player info.
         * @throws {TypeError, GoError}
         */
        unlinkFacebookInstantGame(userId: string, signedPlayerInfo: string): void;

        /**
         * Unlink Apple Game Center from an account.
         *
         * @param userId - User ID.
         * @param playerId - Game center player ID.
         * @param bundleId - Game center bundle ID.
         * @param ts - Timestamp.
         * @param salt - Salt.
         * @param signature - Signature.
         * @param publicKeyURL - Public Key URL.
         * @throws {TypeError, GoError}
         */
        unlinkGameCenter(
            userId: string,
            playerId: string,
            bundleId: string,
            ts: number,
            salt: string,
            signature: string,
            publicKeyURL: string,
        ): void;

        /**
         * Unlink Google from account.
         *
         * @param userId - User ID.
         * @param token - Google token.
         * @throws {TypeError, GoError}
         */
        unlinkGoogle(userId: string, token: string): void;

        /**
         * Unlink Steam from an account.
         *
         * @param userId - User ID.
         * @param token - Steam token.
         * @throws {TypeError, GoError}
         */
        unlinkSteam(userId: string, token: string): void;

        /**
         * List stream presences.
         *
         * @param stream - Stream object.
         * @param includeHidden - Optional argument to include hidden presences in the list or not, default true.
         * @param includeNotHidden - Optional argument to include not hidden presences in the list or not, default true.
         * @returns List of presence objects.
         * @throws {TypeError}
         */
        streamUserList(stream: Stream, includeHidden?: boolean, includeNotHidden?: boolean): Presence[];

        /**
         * Get presence of user in a stream.
         *
         * @param userId - User ID.
         * @param sessionID - Session ID.
         * @param stream - Stream data.
         * @throws {TypeError}
         * @returns Presence object.
         */
        streamUserGet(userId: string, sessionID: string, stream: Stream): Presence;

        /**
         * Add a user to a stream.
         *
         * @param userId - User ID.
         * @param sessionID - Session ID.
         * @param stream - Stream data.
         * @param hidden - Opt. If hidden no presence events are generated for the user.
         * @param persistence - Opt. By default persistence is enabled, if the stream supports it.
         * @param status - Opt. By default no status is set for the user.
         * @throws {TypeError, GoError}
         */
        streamUserJoin(userId: string, sessionID: string, stream: Stream, hidden?: boolean, persistence?: boolean, status?: string): void;

        /**
         * Update user status in a stream.
         *
         * @param userId - User ID.
         * @param sessionID - Session ID.
         * @param stream - Stream data.
         * @param hidden - Opt. If hidden no presence events are generated for the user.
         * @param persistence - Opt. By default persistence is enabled, if the stream supports it.
         * @param status - Opt. By default no status is set for the user.
         * @throws {TypeError, GoError}
         */
        streamUserUpdate(userId: string, sessionID: string, stream: Stream, hidden?: boolean, persistence?: boolean, status?: string): void;

        /**
         * Have a user leave a stream.
         *
         * @param userId - User ID.
         * @param sessionID - Session ID.
         * @param stream - Stream data.
         * @throws {TypeError, GoError}
         */
        streamUserLeave(userId: string, sessionID: string, stream: Stream): void;

        /**
         * Kick user from a stream.
         *
         * @param presence - User presence data.
         * @param stream - Stream data.
         * @throws {TypeError, GoError}
         */
        streamUserKick(presence: Presence, stream: Stream): void;

        /**
         * Count the users in a stream.
         *
         * @param stream - Stream data.
         * @returns the number of users in the stream.
         * @throws {TypeError}
         */
        streamCount(stream: Stream): number

        /**
         * Close a stream.
         *
         * Closing a stream removes all presences currently on it. It can be useful to explicitly close a stream and enable the server to reclaim resources more quickly.
         *
         * @param stream - Stream data.
         * @returns the number of users in the stream.
         * @throws {TypeError}
         */
        streamClose(stream: Stream): void;

        /**
         * Send data to users in a stream.
         *
         * @param stream - Stream data.
         * @param data - Data string to send.
         * @param presences - Opt. List of presences in the stream to send the data to. If null or empty, data is sent to all the users.
         * @param reliable - Opt. If data is sent with delivery guarantees. Defaults to true.
         * @throws {TypeError}
         */
        streamSend(stream: Stream, data: string, presences?: Presence[] | null, reliable?: boolean): void;

        /**
         * Send envelope data to users in a stream.
         *
         * @param stream - Stream data.
         * @param envelope - Envelope object.
         * @param presences - Opt. List of presences in the stream to send the data to. If null or empty, data is sent to all the users.
         * @param reliable - Opt. If data is sent with delivery guarantees. Defaults to true.
         * @throws {TypeError, GoError}
         */
        streamSendRaw(stream: Stream, envelope: {}, presences?: Presence[] | null, reliable?: boolean): void;

        /**
         * Disconnect session.
         *
         * @param sessionID - Session ID.
         * @param sessionID - Opt. Presence disconnect reason.
         * @throws {TypeError, GoError}
         */
         sessionDisconnect(sessionID: string, reason?: PresenceReason): void;

        /**
         * Log out a user from their current session.
         *
         * @param userId - The ID of the user to be logged out.
         * @param token - Opt. The current session authentication token.
         * @param refreshToken - Opt. The current session refresh token.
         * @throws {TypeError, GoError}
         */
         sessionLogout(userId: string, token?: string, refreshToken?:string): void;

        /**
         * Create a new match.
         *
         * @param module - Name of the module the match will run.
         * @param params - Opt. Object with the initial state of the match.
         * @returns the match ID of the created match.
         * @throws {TypeError, GoError}
         */
        matchCreate(module: string, params?: {[key: string]: any}): string;

        /**
         * Get a running match info.
         *
         * @param id - Match ID.
         * @returns match data.
         * @throws {TypeError, GoError}
         */
        matchGet(id: string): Match | null

        /**
         * Find matches with filters.
         *
         * @param limit - Opt. Max number of matches to return. Defaults to 1.
         * @param authoritative - Filter authoritative or non-authoritative matches. If NULL or no value is provided, both authoritative and non-authoritative match.
         * @param label - Filter by a label. If null or no value is provided, all labels are matched.
         * @param minSize - Filter by min number of players in a match. If NULL or no value is provided, there is no lower player bound.
         * @param maxSize - Filter by max number of players in a match. If NULL or no value is provided, there is no upper player bound.
         * @param query - Query by match properties (https://heroiclabs.com/docs/gameplay-matchmaker/#query). If no value is provided, all properties match.
         * @returns list of running game matches that match the specified filters.
         * @throws {TypeError, GoError}
         */
        matchList(limit: number, authoritative?: boolean | null, label?: string | null, minSize?: number | null, maxSize?: number | null, query?: string | null): Match[]

        /**
         * Signal a match and receive a response.
         *
         * @param id - Match ID.
         * @param data - Arbitrary data to pass to the match signal handler.
         * @returns response data from the signal handler, if any.
         * @throws {TypeError, GoError}
         */
        matchSignal(id: string, data: string): string


        /**
         * Send a notification.
         *
         * @param userId - User ID.
         * @param subject - Subject of the notification.
         * @param content - Key value object to send as the notification content.
         * @param code - Custom code for the notification. Must be a positive integer.
         * @param senderID - Opt. Sender ID. Defaults to nil - sender sent.
         * @param persistent - Opt. A non-persistent message will only be received by a client which is currently connected to the server. Defaults to false.
         * @throws {TypeError, GoError}
         */
        notificationSend(userId: string, subject: string, content: {[key: string]: any}, code: number, senderID?: string | null, persistent?: boolean): void;

        /**
         * Send multiple notifications.
         *
         * @param notifications - Array of notifications.
         * @throws {TypeError, GoError}
         */
        notificationsSend(notifications: NotificationRequest[]): void;

        /**
         * Send an in-app notification to all users.
         *
         * @param subject - Subject of the notification.
         * @param content - Key value object to send as the notification content.
         * @param code - Custom code for the notification. Must be a positive integer.
         * @param persistent - Opt. A non-persistent message will only be received by a client which is currently connected to the server. Defaults to false.
         * @throws {TypeError, GoError}
         */
        notificationSendAll(subject: string, content: {[key: string]: any}, code: number, persistent?: boolean): void;

        /**
         * Update user wallet.
         *
         * @param userId - User ID.
         * @param changeset - Object with the wallet changeset data.
         * @param metadata - Opt. Additional metadata to tag the wallet update with.
         * @param updateLedger - Opt. Whether to record this update in the ledger. Default true.
         * @throws {TypeError, GoError}
         */
        walletUpdate(userId: string, changeset: {[key: string]: number}, metadata?: {[key: string]: any}, updateLedger?: boolean): WalletUpdateResult;

        /**
         * Update multiple user wallets.
         *
         * @param updates - The set of user wallet update operations to apply.
         * @param updateLedger - Opt. Whether to record this update in the ledger. Default true.
         * @throws {TypeError, GoError}
         */
        walletsUpdate(updates: WalletUpdate[], updateLedger?: boolean): WalletUpdateResult[];

        /**
         * Update user wallet ledger.
         *
         * @param ledgerID - The ledger id.
         * @param metadata - Additional metadata to tag the wallet update with.
         * @returns updated ledger data.
         * @throws {TypeError, GoError}
         */
        walletLedgerUpdate(ledgerID: string, metadata: {[key: string]: any}): WalletLedgerResult;

        /**
         * Update user wallet ledger.
         *
         * @param userId - User ID
         * @param limit - Opt. Maximum number of items to list. Defaults to 100.
         * @param cursor - Opt. Pagination cursor.
         * @returns Object containing an array of wallet ledger results and a cursor for the next page of results, if there is one.
         * @throws {TypeError, GoError}
         */
        walletLedgerList(userId: string, limit?: number, cursor?: string): WalletLedgerList;

        /**
         * List user's storage objects from a collection.
         *
         * @param userId - Opt. User ID that owns the collection. Call with null to retrieve regardless of the owner.
         * @param collection - Opt. Storage collection.
         * @param limit - Opt. Maximum number of items to list. Defaults to 100.
         * @param cursor - Opt. Pagination cursor.
         * @returns Object containing an array of storage objects and a cursor for the next page of results, if there is one.
         * @throws {TypeError, GoError}
         */
        storageList(userId: string | null | undefined, collection: string, limit?: number, cursor?: string): StorageObjectList;

        /**
         * Get all storage objects matching the parameters.
         *
         * @param keys - Array of storage read objects.
         * @returns Object containing an array of storage objects and a cursor for the next page of results, if there is one.
         * @throws {TypeError, GoError}
         */
        storageRead(keys: StorageReadRequest[]): StorageObject[];

        /**
         * Write storage objects.
         *
         * @param keys - Array of storage objects to write.
         * @returns List of written objects acks.
         * @throws {TypeError, GoError}
         */
        storageWrite(keys: StorageWriteRequest[]): StorageWriteAck[];

        /**
         * Delete storage objects.
         *
         * @param keys - Array of storage objects to write.
         * @returns List of written objects acks.
         * @throws {TypeError, GoError}
         */
        storageDelete(keys: StorageDeleteRequest[]): void;

        /**
         * Update multiple entities.
         * Passing null to any of the arguments will ignore the corresponding update.
         *
         * @param accountUpdates - Array of account updates.
         * @param storageObjectsUpdates - Array of storage objects updates.
         * @param walletUpdates - Array of wallet updates.
         * @param updateLedger - Opt. Wether if the wallet update should also update the wallet ledger. Defaults to false.
         * @returns An object with the results from wallets and storage objects updates.
         * @throws {TypeError, GoError}
         */
        multiUpdate(accountUpdates: UserUpdateAccount[] | null, storageObjectsUpdates: StorageWriteRequest[] | null, walletUpdates: WalletUpdate[] | null, updateLedger?: boolean): {storageWriteAcks: StorageWriteAck[], walletUpdateAcks: WalletUpdateResult[]};

        /**
         * Create a new leaderboard.
         *
         * @param leaderboardID - Leaderboard id.
         * @param authoritative - Opt. Authoritative Leaderboard if true.
         * @param sortOrder - Opt. Sort leaderboard in desc or asc order. Defauts to "desc".
         * @param operator - Opt. Score operator "best", "set" or "incr" (refer to the docs for more info). Defaults to "best".
         * @param resetSchedule - Cron string to set the periodicity of the leaderboard reset. Set as null to never reset.
         * @param metadata - Opt. metadata object.
         * @throws {TypeError, GoError}
         */
        leaderboardCreate(
            leaderboardID: string,
            authoritative: boolean,
            sortOrder?: SortOrder,
            operator?: Operator,
            resetSchedule?: null | string,
            metadata?: {[key: string]: any},
        ): void;

        /**
         * Delete a leaderboard.
         *
         * @param leaderboardID - Leaderboard id.
         * @throws {TypeError, GoError}
         */
        leaderboardDelete(leaderboardID: string): void;

        /**
         * Get a list of tournaments by id.
         *
         * @param categoryStart - Filter leaderboard with categories greater or equal than this value.
         * @param categoryEnd - Filter leaderboard with categories equal or less than this value.
         * @param limit - Return only the required number of leaderboard denoted by this limit value.
         * @param cursor - Cursor to paginate to the next result set. If this is empty/null there is no further results.
         * @returns The leaderboard data for the given ids.
         * @throws {TypeError, GoError}
         */
         leaderboardList(categoryStart?: number, categoryEnd?: number, limit?: number, cursor?: string): LeaderboardList;

        /**
         * List records of a leaderboard.
         *
         * @param leaderboardID - Leaderboard id.
         * @param leaderboardOwners - Array of leaderboard owners.
         * @param limit - Max number of records to return.
         * @param cursor - Page cursor.
         * @param overrideExpiry - Override the time expiry of the leaderboard. (Unix epoch).
         * @returns a list of leaderboard records.
         * @throws {TypeError, GoError}
         */
        leaderboardRecordsList(leaderboardID: string, leaderboardOwners?: string[], limit?: number, cursor?: string, overrideExpiry?: number): LeaderboardRecordList;

        /**
         * Write a new leaderboard record.
         *
         * @param leaderboardID - Leaderboard id.
         * @param ownerID - Array of leaderboard owners.
         * @param username - Username of the scorer.
         * @param score - Score.
         * @param subscore - Subscore.
         * @param metadata - Opt. Metadata object.
         * @param operator - Opt. Override the leaderboard operator.
         * @returns - The created leaderboard record.
         * @throws {TypeError, GoError}
         */
        leaderboardRecordWrite(leaderboardID: string, ownerID: string, username?: string, score?: number, subscore?: number, metadata?: {[key: string]: any}, operator?: OverrideOperator): LeaderboardRecord;

        /**
         * Delete a leaderboard record.
         *
         * @param leaderboardID - Leaderboard id.
         * @param ownerID - Array of leaderboard owners.
         * @throws {TypeError, GoError}
         */
        leaderboardRecordDelete(leaderboardID: string, ownerID: string): void;

        /**
         * Get a list of leaderboards by id.
         *
         * @param leaderboardIds - Leaderboard ids.
         * @returns The leaderboard data for the given ids.
         * @throws {TypeError, GoError}
         */
        leaderboardsGetId(leaderboardIds: string[]): Leaderboard[];

        /**
         * Fetch the list of leaderboard records around the owner.
         *
         * @param leaderboardId - The unique identifier for the leaderboard.
         * @param ownerId - The owner of the score to list records around. Mandatory field.
         * @param limit - Return only the required number of leaderboard records denoted by this limit value.
         * @param cursor - Page cursor.
         * @param overrideExpiry - Records with expiry in the past are not returned unless within this defined limit. Must be equal or greater than 0.
         * @returns The leaderboard records according to ID.
         * @throws {TypeError, GoError}
         */
        leaderboardRecordsHaystack(leaderboardId: string, ownerId: string, limit: number, cursor: string, overrideExpiry: number): LeaderboardRecordList;

        /**
         * Create a new tournament.
         *
         * @param tournamentID - Tournament id.
         * @param authoritative - Opt. Whether or not to only allow authoritative score submissions.
         * @param sortOrder - Opt. Sort tournament in desc or asc order. Defaults to "desc".
         * @param operator - Opt. Score operator "best", "set" or "incr" (refer to the docs for more info). Defaults to "best".
         * @param duration - Opt. Duration of the tournament (unix epoch).
         * @param resetSchedule - Opt. Tournament reset schedule (cron syntax).
         * @param metadata - Opt. metadata object.
         * @param title -  Opt. Tournament title.
         * @param description - Opt. Tournament description.
         * @param category - Opt. Tournament category (1-127).
         * @param startTime - Opt. Tournament start time (unix epoch).
         * @param endTime - Opt. Tournament end time (unix epoch).
         * @param maxSize - Opt. Maximum size of participants in a tournament.
         * @param maxNumScore - Opt. Maximum submission attempts for a tournament record.
         * @param joinRequired - Opt. Whether the tournament needs to be joint before a record write is allowed.
         * @throws {TypeError, GoError}
         */
        tournamentCreate(
            tournamentID: string,
            authoritative: boolean,
            sortOrder: SortOrder,
            operator: Operator,
            duration?: number,
            resetSchedule?: string | null,
            metadata?: {[key: string]: any} | null,
            title?: string | null,
            description?: string | null,
            category?: number | null,
            startTime?: number | null,
            endTime?: number | null,
            maxSize?: number | null,
            maxNumScore?: number | null,
            joinRequired?: boolean,
        ): void;

        /**
         * Delete a tournament.
         *
         * @param tournamentID - Tournament id.
         * @throws {TypeError, GoError}
         */
        tournamentDelete(tournamentID: string): void;

        /**
         * Add additional score attempts to the owner's tournament record.
         *
         * @param tournamentID - Tournament id.
         * @param ownerID - Owner of the record id.
         * @param count - Attempt count to add.
         * @throws {TypeError, GoError}
         */
        tournamentAddAttempt(tournamentID: string, ownerID: string, count: number): void;

        /**
         * Join a tournament.
         *
         * A tournament may need to be joined before the owner can submit scores.
         *
         * @param tournamentID - Tournament id.
         * @param userId - Owner of the record id.
         * @param username - The username of the record owner.
         * @throws {TypeError, GoError}
         */
        tournamentJoin(tournamentID: string, userId: string, username: string): void;

        /**
         * Get a list of tournaments by id.
         *
         * @param tournamentIDs - Tournament ids.
         * @returns The tournament data for the given ids.
         * @throws {TypeError, GoError}
         */
        tournamentsGetId(tournamentIds: string[]): Tournament[];

        /**
         * Get a list of tournaments by id.
         *
         * @param categoryStart - Filter tournament with categories greater or equal than this value.
         * @param categoryEnd - Filter tournament with categories equal or less than this value.
         * @param startTime - Filter tournament with that start after this time.
         * @param endTime - Filter tournament with that end before this time.
         * @param limit - Return only the required number of tournament denoted by this limit value.
         * @param cursor - Cursor to paginate to the next result set. If this is empty/null there is no further results.
         * @returns The tournament data for the given ids.
         * @throws {TypeError, GoError}
         */
        tournamentList(categoryStart?: number, categoryEnd?: number, startTime?: number, endTime?: number, limit?: number, cursor?: string): TournamentList;

        /**
         * List records of a tournament.
         *
         * @param tournamentID - Tournament id.
         * @param tournamentOwners - Array of tournament owners.
         * @param limit - Max number of records to return.
         * @param cursor - Page cursor.
         * @param overrideExpiry - Override the time expiry of the leaderboard. (Unix epoch).
         * @returns a list of tournament records.
         * @throws {TypeError, GoError}
         */
        tournamentRecordsList(tournamentID: string, tournamentOwners?: string[], limit?: number, cursor?: string, overrideExpiry?: number): TournamentRecordList;

        /**
         * Submit a score and optional subscore to a tournament leaderboard.
         *
         * @param id - The unique identifier for the leaderboard to submit to. Mandatory field.
         * @param ownerID - The owner of this score submission. Mandatory field.
         * @param username - Opt. The owner username of this score submission, if it's a user.
         * @param score - Opt. The score to submit. Optional in Lua. Default 0.
         * @param subscore - Opt. A secondary subscore parameter for the submission. Optional in Lua. Default 0.
         * @param metadata - Opt. The metadata you want associated to this submission.
         * @param operator - Opt. Override the tournament operator.
         * @returns The tournament data for the given ids.
         * @throws {TypeError, GoError}
         */
        tournamentRecordWrite(id: string, ownerID: string, username?: string, score?: number, subscore?: number, metadata?: {[key: string]: any}, operator?: OverrideOperator): LeaderboardRecord;

        /**
         * Fetch the list of tournament records around the owner.
         *
         * @param id - The unique identifier for the leaderboard to submit to. Mandatory field.
         * @param ownerId - The owner of this score submission. Mandatory field.
         * @param limit - Opt. The owner username of this score submission, if it's a user.
         * @param cursor - Page cursor.
         * @param expiry - Opt. Expiry Unix epoch.
         * @returns The tournament data for the given ids.
         * @throws {TypeError, GoError}
         */
        tournamentRecordsHaystack(id: string, ownerId: string, limit?: number, cursor: string, expiry?: number): TournamentRecordList;

        /**
         * Create a new group.
         *
         * @param userId - The user ID to be associated as the group superadmin.
         * @param name - Group name, must be set and unique.
         * @param creatorId - Opt. The user ID to be associated as creator. If not set or null system user will be set.
         * @param lang - Opt. Group language. Will default to 'en'.
         * @param description - Opt. Group description, use null to leave empty.
         * @param avatarURL - Opt. URL to the group avatar, use null to leave empty.
         * @param open - Opt. Whether the group is for anyone to join, or members will need to send invitations to join. Defaults to false.
         * @param metadata - Opt. Custom information to store for this group, use null to leave empty.
         * @param limit - Opt. Maximum number of members to have in the group. Defaults to 100.
         * @returns An array of group objects.
         * @throws {TypeError, GoError}
         */
        groupCreate(userId: string, name: string, creatorId?: string | null, lang?: string | null, description?: string | null, avatarURL?: string | null, open?: boolean | null, metadata?: {[key: string]: any} | null, limit?: number | null): Group;

        /**
         * Update a group with various configuration settings.
         * The group which is updated can change some or all of its fields.
         *
         * @param groupId - The group ID to update.
         * @param userId - The user ID calling group Update. Use null to use system user.
         * @param name - Group name, use null to not update.
         * @param creatorId - The user ID to be associated as creator, use null to not update.
         * @param lang - Group language, use null to not update.
         * @param description - Group description, use null to not update.
         * @param avatarURL - URL to the group avatar, use null to not update.
         * @param open - Whether the group is for anyone to join or not. Use null to not update.
         * @param metadata - Custom information to store for this group. Use null to not update.
         * @param limit - Maximum number of members to have in the group. Use null if field is not being updated.
         * @throws {TypeError, GoError}
         */
        groupUpdate(groupId: string, userId: string, name?: string | null, creatorID?: string | null, lang?: string | null, description?: string | null, avatarURL?: string | null, open?: boolean | null, metadata?: {[key: string]: any} | null, limit?: number | null): void;

        /**
         * Delete a group.
         *
         * @param groupID - The group ID to update.
         * @throws {TypeError, GoError}
         */
        groupDelete(groupID: string): void;

        /**
         * Kick users from a group.
         *
         * @param groupID - The group ID to update.
         * @param userIds - Array of user IDs to be kicked from the group.
         * @param callerID - Opt. User ID mandating the operation to check for sufficient priviledges. Defaults to admin user if empty.
         * @throws {TypeError, GoError}
         */
        groupUsersKick(groupID: string, userIds: string[], callerID?: string): void;

        /**
         * List all members, admins and superadmins which belong to a group.
         * This also list incoming join requests too.
         *
         * @param groupID - The group ID to update.
         * @param limit - Opt. Max number of returned results. Defaults to 100.
         * @param state - Opt. Filter users by their group state (0: Superadmin, 1: Admin, 2: Member, 3: Requested to join). Use undefined to return all states.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A list of group members.
         * @throws {TypeError, GoError}
         */
        groupUsersList(groupID: string, limit?: number, state?: number, cursor?: string): GroupUserList;

        /**
         * List groups, admins and superadmins which belong to a group.
         *
         * @param name - Opt. Lookup group by name. '%' Suffix is supported for prefix match. Lookup by name is mutually exclusive to the remaining filters. Pass null to use other filters.
         * @param langTag - Opt. Filter results by language tag. Pass null to disregard filter.
         * @param open - Opt. Filter groups by open or closes state. Pass null for either.
         * @param members - Opt. Filter results by an upper bound number of group members. Pass null to disregard filter.
         * @param limit - Opt. Max number of returned results. Defaults to 100.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A list of groups matching the filter criteria.
         * @throws {TypeError, GoError}
         */
        groupsList(name?: string, langTag?: string, open?: boolean, members?: number, limit?: number, cursor?: string): GroupList;

        /**
         * List all groups the user belongs to.
         *
         * @param userId - User ID.
         * @param limit - Opt. Max number of returned results. Defaults to 100.
         * @param state - Opt. Filter users by their group state (0: Superadmin, 1: Admin, 2: Member, 3: Requested to join). Use undefined to return all states.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A list of group members.
         * @throws {TypeError, GoError}
         */
        userGroupsList(userId: string, limit?: number, state?: number, cursor?: string): UserGroupList;

        /**
         * List a user's friends.
         *
         * @param userId - User ID.
         * @param limit - Opt. Max number of returned results. Defaults to 100.
         * @param state - Opt. Filter users by their group state (friend(0), invite_sent(1), invite_received(2), blocked(3)). Use undefined to return all states.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A list of friends.
         * @throws {TypeError, GoError}
         */
        friendsList(userId: string, limit?: number, state?: number, cursor?: string): FriendList;

        /**
         * Add friends to a user.
         *
         * @param userId - User ID.
         * @param username - Username.
         * @param ids - The IDs of the users you want to add as friends.
         * @param usernames - The usernames of the users you want to add as friends.
         * @throws {TypeError, GoError}
         */
        friendsAdd(userId: string, username: string, ids: string[], usernames: string[]): FriendList;

        /**
         * Delete friends from a user.
         *
         * @param userId - User ID.
         * @param username - Username.
         * @param ids - The IDs of the users you want to delete as friends.
         * @param usernames - The usernames of the users you want to delete as friends.
         * @throws {TypeError, GoError}
         */
        friendsDelete(userId: string, username: string, ids: string[], usernames: string[]): FriendList;

        /**
         * Block friends for a user.
         *
         * @param userId - User ID.
         * @param username - Username.
         * @param ids - The IDs of the users you want to block as friends.
         * @param usernames - The usernames of the users you want to block as friends.
         * @throws {TypeError, GoError}
         */
        friendsBlock(userId: string, username: string, ids: string[], usernames: string[]): FriendList;

        /**
         * Join a user to a group.
         *
         * @param groupID - Group ID.
         * @param userId - User ID to join the group.
         * @param username - Username of the user to join the group.
         * @throws {TypeError, GoError}
         */
        groupUserJoin(groupID: string, userId: string, username: string): void;

        /**
         * Leave a user from a group.
         *
         * @param groupID - Group ID.
         * @param userId - User ID to join the group.
         * @param username - Username of the user to join the group.
         * @throws {TypeError, GoError}
         */
        groupUserLeave(groupID: string, userId: string, username: string): void;

        /**
         * Add multiple users to a group.
         *
         * @param groupID - Group ID.
         * @param userIds - Array of userIds to add the group.
         * @param callerID - Opt. User ID mandating the operation to check for sufficient priviledges. Defaults to admin user if empty.
         * @throws {TypeError, GoError}
         */
        groupUsersAdd(groupID: string, userIds: string[], callerID?: string): void;

        /**
         * Ban multiple users from a group.
         *
         * @param groupID - Group ID.
         * @param userIds - Array of userIds to ban from the group.
         * @param callerID - Opt. User ID mandating the operation to check for sufficient priviledges. Defaults to admin user if empty.
         * @throws {TypeError, GoError}
         */
         groupUsersBan(groupID: string, userIds: string[], callerID?: string): void;

        /**
         * Promote users in a group.
         *
         * @param groupID - Group ID.
         * @param userIds - Array of userIds in the group to promote.
         * @param callerID - Opt. User ID mandating the operation to check for sufficient priviledges. Defaults to admin user if empty.
         * @throws {TypeError, GoError}
         */
        groupUsersPromote(groupID: string, userIds: string[], callerID?: string): void;

        /**
         * Demote users in a group.
         *
         * @param groupID - Group ID.
         * @param userIds - Array of userIds in the group to demote.
         * @param callerID - Opt. User ID mandating the operation to check for sufficient priviledges. Defaults to admin user if empty.
         * @throws {TypeError, GoError}
         */
        groupUsersDemote(groupID: string, userIds: string[], callerID?: string): void;

        /**
         * Fetch one or more groups by their ID.
         *
         * @param groupIDs - A set of strings of the ID for the groups to get.
         * @returns An array of group objects.
         */
        groupsGetId(groupIDs: string[]): Group[];

        /**
         * Read a file relative from the runtime path.
         *
         * @param relPath - Relative Path.
         * @returns The content of the file as a string, if found.
         * @throws {TypeError, GoError}
         */
        fileRead(relPath: string): string;

        /**
         * Validate an Apple receipt containing purchases.
         *
         * @param userID - User ID.
         * @param receipt - Apple receipt to validate.
         * @param persist - Opt. Whether to persist the receipt validation. Defaults to true.
         * @param passwordOverride - Opt. Override the configured Apple Store Validation Password.
         * @returns The result of the validated and stored purchases from the receipt.
         * @throws {TypeError, GoError}
         */
        purchaseValidateApple(userID: string, receipt: string, persist?: boolean, passwordOverride?: string): ValidatePurchaseResponse

        /**
         * Validate a Google purchase payload.
         *
         * @param userID - User ID.
         * @param purchase - Google purchase payload to validate.
         * @param persist - Opt. Whether to persist the receipt validation. Defaults to true.
         * @param clientEmailOverride - Opt. Override the configured Google Service Account client email.
         * @param privateKeyOverride - Opt. Override the configured Google Service Account private key.
         * @returns The result of the validated and stored purchases from the receipt.
         * @throws {TypeError, GoError}
         */
         purchaseValidateGoogle(userID: string, purchase: string, persist?: boolean, clientEmailOverride?: string, privateKeyOverride?: string): ValidatePurchaseResponse

        /**
         * Validate a Huawei purchase payload.
         *
         * @param userID - User ID.
         * @param receipt - Apple receipt to validate.
         * @param persist - Opt. Whether to persist the receipt validation. Defaults to true.
         * @returns The result of the validated and stored purchases from the receipt.
         * @throws {TypeError, GoError}
         */
        purchaseValidateHuawei(userID: string, receipt: string, signature: string, persist?: boolean): ValidatePurchaseResponse

        /**
         * Get a validated purchase data by transaction ID.
         *
         * @param transactionID - Transaction ID. For Google/Huawei this is the purchaseToken value of the purchase data.
         * @returns The data of the validated and stored purchase.
         * @throws {TypeError, GoError}
         */
        purchaseGetByTransactionId(transactionID: string): ValidatedPurchaseOwner

        /**
         * List validated and stored purchases.
         *
         * @param userID - Opt. User ID.
         * @param limit - Opt. Limit of results per page. Must be a value between 1 and 100.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A page of validated and stored purchases.
         * @throws {TypeError, GoError}
         */
        purchasesList(userID?: string, limit?: number, cursor?: string): ValidatedPurchaseList

        /**
         * Validate an Apple receipt containing a subscription.
         *
         * @param userID - User ID.
         * @param receipt - Apple subscription receipt to validate.
         * @param persist - Opt. Whether to persist the subscription validation. Defaults to true.
         * @param passwordOverride - Opt. Override the configured Apple Store Validation Password.
         * @returns The result of the validated and stored purchases from the receipt.
         * @throws {TypeError, GoError}
         */
        subscriptionValidateApple(userID: string, receipt: string, persist?: boolean, passwordOverride?: string): ValidateSubscriptionResponse

        /**
         * Validate a Google receipt containing a subscription.
         *
         * @param userID - User ID.
         * @param subscription - Google subscription payload to validate.
         * @param persist - Opt. Whether to persist the subscription receipt validation. Defaults to true.
         * @param clientEmailOverride - Opt. Override the configured Google Service Account client email.
         * @param privateKeyOverride - Opt. Override the configured Google Service Account private key.
         * @returns The result of the validated and stored purchases from the receipt.
         * @throws {TypeError, GoError}
         */
        subscriptionValidateGoogle(userID: string, subscription: string, persist?: boolean, clientEmailOverride?: string, privateKeyOverride?: string): ValidateSubscriptionResponse

        /**
         * Get a validated subscription data by product ID.
         *
         * @param userID - User ID.
         * @param productID - Product ID. For Google this is the subscriptionToken value of the purchase data.
         * @returns The data of the validated and stored purchase.
         * @throws {TypeError, GoError}
         */
        subscriptionGetByProductId(userID: string, productID: string): ValidatedPurchaseOwner

        /**
         * List validated and stored purchases.
         *
         * @param userID - Opt. User ID.
         * @param limit - Opt. Limit of results per page. Must be a value between 1 and 100.
         * @param cursor - Opt. A cursor used to fetch the next page when applicable.
         * @returns A page of validated and stored purchases.
         * @throws {TypeError, GoError}
         */
        purchasesList(userID?: string, limit?: number, cursor?: string): ValidatedPurchaseList

        /**
         * Send channel message.
         *
         * @param channelId - Channel ID.
         * @param content - Message content.
         * @param senderId - Opt. Message sender ID.
         * @param senderUsername - Opt. Sender username. Defaults to system user.
         * @param persist - Opt. Store message. Defaults to true.
         * @returns Ack of sent message.
         * @throws {TypeError, GoError}
         */
        channelMessageSend(channelId: string, content?: {[key: string]: any}, senderId?: string, senderUsername?: string, persist?: boolean): ChannelMessageSendAck

        /**
         * Update channel message.
         *
         * @param channelId - Channel ID.
         * @param messageId - Message ID of message to be updated.
         * @param content - Message content.
         * @param senderId - Opt. Message sender ID.
         * @param senderUsername - Opt. Sender username. Defaults to system user.
         * @param persist - Opt. Store message. Defaults to true.
         * @returns Ack of sent message.
         * @throws {TypeError, GoError}
         */
         channelMessageUpdate(channelId: string, messageId: string, content?: {[key: string]: any}, senderId?: string, senderUsername?: string, persist?: boolean): ChannelMessageSendAck

        /**
         * List channel messages.
         *
         * @param channelId - Channel ID.
         * @param limit - The number of messages to return per page.
         * @param forward - Whether to list messages from oldest to newest, or newest to oldest.
         * @param cursor - Opt. Pagination cursor.
         * @returns List of channel messages.
         * @throws {TypeError, GoError}
         */
         channelMessagesList(channelId: string, limit?: number, forward?: boolean, cursor?: string): ChannelMessageList

        /**
         * Send channel message.
         *
         * @param sender - The user ID of the sender.
         * @param target - The user ID to DM with, group ID to chat with, or room channel name to join.
         * @param type - Channel type.
         * @returns The channelId.
         * @throws {TypeError, GoError}
         */
        channelIdBuild(sender: string, target: string, chanType: ChanType): string

        /**
         * Parses a CRON expression and a timestamp in UTC seconds, and returns the next matching timestamp in UTC seconds.
         *
         * @param cron - The cron expression.
         * @param timestamp - UTC unix seconds timestamp.
         * @returns The next cron matching timestamp in UTC seconds.
         * @throws {TypeError, GoError}
         */
         cronNext(cron: string, timestamp: number): number
    }

    /**
     * The start function for Nakama to initialize the server logic.
     */
    export interface InitModule {
        /**
         * Executed at server startup.
         *
         * @remarks
         * This function executed will block the start up sequence of the game server. You must use
         * care to limit the compute time of logic run in this function.
         *
         * @param ctx - The context of the execution.
         * @param logger - The server logger.
         * @param nk - The Nakama server APIs.
         * @param initializer - The injector to initialize features in the game server.
         */
        (ctx: Context, logger: Logger, nk: Nakama, initializer: Initializer): void;
    }
}
