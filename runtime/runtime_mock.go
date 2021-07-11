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

package runtime

import (
	"context"
	"os"

	"github.com/heroiclabs/nakama-common/api"
	"github.com/heroiclabs/nakama-common/rtapi"
	"github.com/heroiclabs/nakama-common/runtime"
)

/*
MockNakamaModule can be used to imitate/mock the Nakama server framework API so that it can return data relevant to your test.

Implement any of the functions that your code relies on like this:

	mockNkModule := &runtime.MockNakamaModule{
		PurchaseValidateAppleFn: func(ctx context.Context, userID, receipt string) (*api.ValidatePurchaseResponse, error) {
			return &api.ValidatePurchaseResponse{
				ValidatedPurchases: []*api.ValidatedPurchase{{ProductId: "my-test-product-id"}},
			}, nil
		},
		WalletUpdateFn: func(ctx context.Context, userID string, changeset map[string]int64, metadata map[string]interface{}, updateLedger bool) (map[string]int64, map[string]int64, error) {
			return map[string]int64{"gems": 10}, nil, nil
		},
	}

*/
type MockNakamaModule struct {
	AuthenticateAppleFn               func(ctx context.Context, token, username string, create bool) (string, string, bool, error)
	AuthenticateCustomFn              func(ctx context.Context, id, username string, create bool) (string, string, bool, error)
	AuthenticateDeviceFn              func(ctx context.Context, id, username string, create bool) (string, string, bool, error)
	AuthenticateEmailFn               func(ctx context.Context, email, password, username string, create bool) (string, string, bool, error)
	AuthenticateFacebookFn            func(ctx context.Context, token string, importFriends bool, username string, create bool) (string, string, bool, error)
	AuthenticateFacebookInstantGameFn func(ctx context.Context, signedPlayerInfo string, username string, create bool) (string, string, bool, error)
	AuthenticateGameCenterFn          func(ctx context.Context, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl, username string, create bool) (string, string, bool, error)
	AuthenticateGoogleFn              func(ctx context.Context, token, username string, create bool) (string, string, bool, error)
	AuthenticateSteamFn               func(ctx context.Context, token, username string, create bool) (string, string, bool, error)
	AuthenticateTokenGenerateFn       func(userID, username string, exp int64, vars map[string]string) (string, int64, error)
	AccountGetIdFn                    func(ctx context.Context, userID string) (*api.Account, error)
	AccountsGetIdFn                   func(ctx context.Context, userIDs []string) ([]*api.Account, error)
	AccountUpdateIdFn                 func(ctx context.Context, userID, username string, metadata map[string]interface{}, displayName, timezone, location, langTag, avatarUrl string) error
	AccountDeleteIdFn                 func(ctx context.Context, userID string, recorded bool) error
	AccountExportIdFn                 func(ctx context.Context, userID string) (string, error)
	UsersGetIdFn                      func(ctx context.Context, userIDs []string, facebookIDs []string) ([]*api.User, error)
	UsersGetUsernameFn                func(ctx context.Context, usernames []string) ([]*api.User, error)
	UsersBanIdFn                      func(ctx context.Context, userIDs []string) error
	UsersUnbanIdFn                    func(ctx context.Context, userIDs []string) error
	LinkAppleFn                       func(ctx context.Context, userID, token string) error
	LinkCustomFn                      func(ctx context.Context, userID, customID string) error
	LinkDeviceFn                      func(ctx context.Context, userID, deviceID string) error
	LinkEmailFn                       func(ctx context.Context, userID, email, password string) error
	LinkFacebookFn                    func(ctx context.Context, userID, username, token string, importFriends bool) error
	LinkFacebookInstantGameFn         func(ctx context.Context, userID, signedPlayerInfo string) error
	LinkGameCenterFn                  func(ctx context.Context, userID, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl string) error
	LinkGoogleFn                      func(ctx context.Context, userID, token string) error
	LinkSteamFn                       func(ctx context.Context, userID, username, token string, importFriends bool) error
	ReadFileFn                        func(path string) (*os.File, error)
	UnlinkAppleFn                     func(ctx context.Context, userID, token string) error
	UnlinkCustomFn                    func(ctx context.Context, userID, customID string) error
	UnlinkDeviceFn                    func(ctx context.Context, userID, deviceID string) error
	UnlinkEmailFn                     func(ctx context.Context, userID, email string) error
	UnlinkFacebookFn                  func(ctx context.Context, userID, token string) error
	UnlinkFacebookInstantGameFn       func(ctx context.Context, userID, signedPlayerInfo string) error
	UnlinkGameCenterFn                func(ctx context.Context, userID, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl string) error
	UnlinkGoogleFn                    func(ctx context.Context, userID, token string) error
	UnlinkSteamFn                     func(ctx context.Context, userID, token string) error
	StreamUserListFn                  func(mode uint8, subject, subcontext, label string, includeHidden, includeNotHidden bool) ([]runtime.Presence, error)
	StreamUserGetFn                   func(mode uint8, subject, subcontext, label, userID, sessionID string) (runtime.PresenceMeta, error)
	StreamUserJoinFn                  func(mode uint8, subject, subcontext, label, userID, sessionID string, hidden, persistence bool, status string) (bool, error)
	StreamUserUpdateFn                func(mode uint8, subject, subcontext, label, userID, sessionID string, hidden, persistence bool, status string) error
	StreamUserLeaveFn                 func(mode uint8, subject, subcontext, label, userID, sessionID string) error
	StreamUserKickFn                  func(mode uint8, subject, subcontext, label string, presence runtime.Presence) error
	StreamCountFn                     func(mode uint8, subject, subcontext, label string) (int, error)
	StreamCloseFn                     func(mode uint8, subject, subcontext, label string) error
	StreamSendFn                      func(mode uint8, subject, subcontext, label, data string, presences []runtime.Presence, reliable bool) error
	StreamSendRawFn                   func(mode uint8, subject, subcontext, label string, msg *rtapi.Envelope, presences []runtime.Presence, reliable bool) error
	SessionDisconnectFn               func(ctx context.Context, sessionID string, reason ...runtime.PresenceReason) error
	SessionLogoutFn                   func(userID, token, refreshToken string) error
	MatchCreateFn                     func(ctx context.Context, module string, params map[string]interface{}) (string, error)
	MatchGetFn                        func(ctx context.Context, id string) (*api.Match, error)
	MatchListFn                       func(ctx context.Context, limit int, authoritative bool, label string, minSize, maxSize *int, query string) ([]*api.Match, error)
	NotificationSendFn                func(ctx context.Context, userID, subject string, content map[string]interface{}, code int, sender string, persistent bool) error
	NotificationsSendFn               func(ctx context.Context, notifications []*runtime.NotificationSend) error
	WalletUpdateFn                    func(ctx context.Context, userID string, changeset map[string]int64, metadata map[string]interface{}, updateLedger bool) (map[string]int64, map[string]int64, error)
	WalletsUpdateFn                   func(ctx context.Context, updates []*runtime.WalletUpdate, updateLedger bool) ([]*runtime.WalletUpdateResult, error)
	WalletLedgerUpdateFn              func(ctx context.Context, itemID string, metadata map[string]interface{}) (runtime.WalletLedgerItem, error)
	WalletLedgerListFn                func(ctx context.Context, userID string, limit int, cursor string) ([]runtime.WalletLedgerItem, string, error)
	StorageListFn                     func(ctx context.Context, userID, collection string, limit int, cursor string) ([]*api.StorageObject, string, error)
	StorageReadFn                     func(ctx context.Context, reads []*runtime.StorageRead) ([]*api.StorageObject, error)
	StorageWriteFn                    func(ctx context.Context, writes []*runtime.StorageWrite) ([]*api.StorageObjectAck, error)
	StorageDeleteFn                   func(ctx context.Context, deletes []*runtime.StorageDelete) error
	MultiUpdateFn                     func(ctx context.Context, accountUpdates []*runtime.AccountUpdate, storageWrites []*runtime.StorageWrite, walletUpdates []*runtime.WalletUpdate, updateLedger bool) ([]*api.StorageObjectAck, []*runtime.WalletUpdateResult, error)
	LeaderboardCreateFn               func(ctx context.Context, id string, authoritative bool, sortOrder, operator, resetSchedule string, metadata map[string]interface{}) error
	LeaderboardDeleteFn               func(ctx context.Context, id string) error
	LeaderboardRecordsListFn          func(ctx context.Context, id string, ownerIDs []string, limit int, cursor string, expiry int64) ([]*api.LeaderboardRecord, []*api.LeaderboardRecord, string, string, error)
	LeaderboardRecordWriteFn          func(ctx context.Context, id, ownerID, username string, score, subscore int64, metadata map[string]interface{}) (*api.LeaderboardRecord, error)
	LeaderboardRecordDeleteFn         func(ctx context.Context, id, ownerID string) error
	PurchaseValidateAppleFn           func(ctx context.Context, userID, receipt string) (*api.ValidatePurchaseResponse, error)
	PurchaseValidateGoogleFn          func(ctx context.Context, userID, receipt string) (*api.ValidatePurchaseResponse, error)
	PurchaseValidateHuaweiFn          func(ctx context.Context, userID, signature, inAppPurchaseData string) (*api.ValidatePurchaseResponse, error)
	PurchasesListFn                   func(ctx context.Context, userID string, limit int, cursor string) (*api.PurchaseList, error)
	PurchaseGetByTransactionIdFn      func(ctx context.Context, transactionID string) (string, *api.ValidatedPurchase, error)
	TournamentCreateFn                func(ctx context.Context, id string, sortOrder, operator, resetSchedule string, metadata map[string]interface{}, title, description string, category, startTime, endTime, duration, maxSize, maxNumScore int, joinRequired bool) error
	TournamentDeleteFn                func(ctx context.Context, id string) error
	TournamentAddAttemptFn            func(ctx context.Context, id, ownerID string, count int) error
	TournamentJoinFn                  func(ctx context.Context, id, ownerID, username string) error
	TournamentsGetIdFn                func(ctx context.Context, tournamentIDs []string) ([]*api.Tournament, error)
	TournamentListFn                  func(ctx context.Context, categoryStart, categoryEnd, startTime, endTime, limit int, cursor string) (*api.TournamentList, error)
	TournamentRecordsListFn           func(ctx context.Context, tournamentId string, ownerIDs []string, limit int, cursor string, overrideExpiry int64) ([]*api.LeaderboardRecord, []*api.LeaderboardRecord, string, string, error)
	TournamentRecordWriteFn           func(ctx context.Context, id, ownerID, username string, score, subscore int64, metadata map[string]interface{}) (*api.LeaderboardRecord, error)
	TournamentRecordsHaystackFn       func(ctx context.Context, id, ownerID string, limit int, expiry int64) ([]*api.LeaderboardRecord, error)
	GroupsGetIdFn                     func(ctx context.Context, groupIDs []string) ([]*api.Group, error)
	GroupCreateFn                     func(ctx context.Context, userID, name, creatorID, langTag, description, avatarUrl string, open bool, metadata map[string]interface{}, maxCount int) (*api.Group, error)
	GroupUpdateFn                     func(ctx context.Context, id, name, creatorID, langTag, description, avatarUrl string, open bool, metadata map[string]interface{}, maxCount int) error
	GroupDeleteFn                     func(ctx context.Context, id string) error
	GroupUserJoinFn                   func(ctx context.Context, groupID, userID, username string) error
	GroupUserLeaveFn                  func(ctx context.Context, groupID, userID, username string) error
	GroupUsersAddFn                   func(ctx context.Context, groupID string, userIDs []string) error
	GroupUsersKickFn                  func(ctx context.Context, groupID string, userIDs []string) error
	GroupUsersPromoteFn               func(ctx context.Context, groupID string, userIDs []string) error
	GroupUsersDemoteFn                func(ctx context.Context, groupID string, userIDs []string) error
	GroupUsersListFn                  func(ctx context.Context, id string, limit int, state *int, cursor string) ([]*api.GroupUserList_GroupUser, string, error)
	UserGroupsListFn                  func(ctx context.Context, userID string, limit int, state *int, cursor string) ([]*api.UserGroupList_UserGroup, string, error)
	FriendsListFn                     func(ctx context.Context, userID string, limit int, state *int, cursor string) ([]*api.Friend, string, error)
	EventFn                           func(ctx context.Context, evt *api.Event) error
}

func (nk *MockNakamaModule) AuthenticateApple(ctx context.Context, token, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateAppleFn(ctx, token, username, create)
}
func (nk *MockNakamaModule) AuthenticateCustom(ctx context.Context, id, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateCustomFn(ctx, id, username, create)
}
func (nk *MockNakamaModule) AuthenticateDevice(ctx context.Context, id, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateDeviceFn(ctx, id, username, create)
}
func (nk *MockNakamaModule) AuthenticateEmail(ctx context.Context, email, password, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateEmailFn(ctx, email, password, username, create)
}
func (nk *MockNakamaModule) AuthenticateFacebook(ctx context.Context, token string, importFriends bool, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateFacebookFn(ctx, token, importFriends, username, create)
}
func (nk *MockNakamaModule) AuthenticateFacebookInstantGame(ctx context.Context, signedPlayerInfo string, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateFacebookInstantGameFn(ctx, signedPlayerInfo, username, create)
}
func (nk *MockNakamaModule) AuthenticateGameCenter(ctx context.Context, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateGameCenterFn(ctx, playerID, bundleID, timestamp, salt, signature, publicKeyUrl, username, create)
}
func (nk *MockNakamaModule) AuthenticateGoogle(ctx context.Context, token, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateGoogleFn(ctx, token, username, create)
}
func (nk *MockNakamaModule) AuthenticateSteam(ctx context.Context, token, username string, create bool) (string, string, bool, error) {
	return nk.AuthenticateSteamFn(ctx, token, username, create)
}
func (nk *MockNakamaModule) AuthenticateTokenGenerate(userID, username string, exp int64, vars map[string]string) (string, int64, error) {
	return nk.AuthenticateTokenGenerateFn(userID, username, exp, vars)
}
func (nk *MockNakamaModule) AccountGetId(ctx context.Context, userID string) (*api.Account, error) {
	return nk.AccountGetIdFn(ctx, userID)
}
func (nk *MockNakamaModule) AccountsGetId(ctx context.Context, userIDs []string) ([]*api.Account, error) {
	return nk.AccountsGetIdFn(ctx, userIDs)
}
func (nk *MockNakamaModule) AccountUpdateId(ctx context.Context, userID, username string, metadata map[string]interface{}, displayName, timezone, location, langTag, avatarUrl string) error {
	return nk.AccountUpdateIdFn(ctx, userID, username, metadata, displayName, timezone, location, langTag, avatarUrl)
}
func (nk *MockNakamaModule) AccountDeleteId(ctx context.Context, userID string, recorded bool) error {
	return nk.AccountDeleteIdFn(ctx, userID, recorded)
}
func (nk *MockNakamaModule) AccountExportId(ctx context.Context, userID string) (string, error) {
	return nk.AccountExportIdFn(ctx, userID)
}
func (nk *MockNakamaModule) UsersGetId(ctx context.Context, userIDs []string, facebookIDs []string) ([]*api.User, error) {
	return nk.UsersGetIdFn(ctx, userIDs, facebookIDs)
}
func (nk *MockNakamaModule) UsersGetUsername(ctx context.Context, usernames []string) ([]*api.User, error) {
	return nk.UsersGetUsernameFn(ctx, usernames)
}
func (nk *MockNakamaModule) UsersBanId(ctx context.Context, userIDs []string) error {
	return nk.UsersBanIdFn(ctx, userIDs)
}
func (nk *MockNakamaModule) UsersUnbanId(ctx context.Context, userIDs []string) error {
	return nk.UsersUnbanIdFn(ctx, userIDs)
}
func (nk *MockNakamaModule) LinkApple(ctx context.Context, userID, token string) error {
	return nk.LinkAppleFn(ctx, userID, token)
}
func (nk *MockNakamaModule) LinkCustom(ctx context.Context, userID, customID string) error {
	return nk.LinkCustomFn(ctx, userID, customID)
}
func (nk *MockNakamaModule) LinkDevice(ctx context.Context, userID, deviceID string) error {
	return nk.LinkDeviceFn(ctx, userID, deviceID)
}
func (nk *MockNakamaModule) LinkEmail(ctx context.Context, userID, email, password string) error {
	return nk.LinkEmailFn(ctx, userID, email, password)
}
func (nk *MockNakamaModule) LinkFacebook(ctx context.Context, userID, username, token string, importFriends bool) error {
	return nk.LinkFacebookFn(ctx, userID, username, token, importFriends)
}
func (nk *MockNakamaModule) LinkFacebookInstantGame(ctx context.Context, userID, signedPlayerInfo string) error {
	return nk.LinkFacebookInstantGameFn(ctx, userID, signedPlayerInfo)
}
func (nk *MockNakamaModule) LinkGameCenter(ctx context.Context, userID, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl string) error {
	return nk.LinkGameCenterFn(ctx, userID, playerID, bundleID, timestamp, salt, signature, publicKeyUrl)
}
func (nk *MockNakamaModule) LinkGoogle(ctx context.Context, userID, token string) error {
	return nk.LinkGoogleFn(ctx, userID, token)
}
func (nk *MockNakamaModule) LinkSteam(ctx context.Context, userID, username, token string, importFriends bool) error {
	return nk.LinkSteamFn(ctx, userID, username, token, importFriends)
}
func (nk *MockNakamaModule) ReadFile(path string) (*os.File, error) {
	return nk.ReadFileFn(path)
}
func (nk *MockNakamaModule) UnlinkApple(ctx context.Context, userID, token string) error {
	return nk.UnlinkAppleFn(ctx, userID, token)
}
func (nk *MockNakamaModule) UnlinkCustom(ctx context.Context, userID, customID string) error {
	return nk.UnlinkCustomFn(ctx, userID, customID)
}
func (nk *MockNakamaModule) UnlinkDevice(ctx context.Context, userID, deviceID string) error {
	return nk.UnlinkDeviceFn(ctx, userID, deviceID)
}
func (nk *MockNakamaModule) UnlinkEmail(ctx context.Context, userID, email string) error {
	return nk.UnlinkEmailFn(ctx, userID, email)
}
func (nk *MockNakamaModule) UnlinkFacebook(ctx context.Context, userID, token string) error {
	return nk.UnlinkFacebookFn(ctx, userID, token)
}
func (nk *MockNakamaModule) UnlinkFacebookInstantGame(ctx context.Context, userID, signedPlayerInfo string) error {
	return nk.UnlinkFacebookInstantGameFn(ctx, userID, signedPlayerInfo)
}
func (nk *MockNakamaModule) UnlinkGameCenter(ctx context.Context, userID, playerID, bundleID string, timestamp int64, salt, signature, publicKeyUrl string) error {
	return nk.UnlinkGameCenterFn(ctx, userID, playerID, bundleID, timestamp, salt, signature, publicKeyUrl)
}
func (nk *MockNakamaModule) UnlinkGoogle(ctx context.Context, userID, token string) error {
	return nk.UnlinkGoogleFn(ctx, userID, token)
}
func (nk *MockNakamaModule) UnlinkSteam(ctx context.Context, userID, token string) error {
	return nk.UnlinkSteamFn(ctx, userID, token)
}
func (nk *MockNakamaModule) StreamUserList(mode uint8, subject, subcontext, label string, includeHidden, includeNotHidden bool) ([]runtime.Presence, error) {
	return nk.StreamUserListFn(mode, subject, subcontext, label, includeHidden, includeNotHidden)
}
func (nk *MockNakamaModule) StreamUserGet(mode uint8, subject, subcontext, label, userID, sessionID string) (runtime.PresenceMeta, error) {
	return nk.StreamUserGetFn(mode, subject, subcontext, label, userID, sessionID)
}
func (nk *MockNakamaModule) StreamUserJoin(mode uint8, subject, subcontext, label, userID, sessionID string, hidden, persistence bool, status string) (bool, error) {
	return nk.StreamUserJoinFn(mode, subject, subcontext, label, userID, sessionID, hidden, persistence, status)
}
func (nk *MockNakamaModule) StreamUserUpdate(mode uint8, subject, subcontext, label, userID, sessionID string, hidden, persistence bool, status string) error {
	return nk.StreamUserUpdateFn(mode, subject, subcontext, label, userID, sessionID, hidden, persistence, status)
}
func (nk *MockNakamaModule) StreamUserLeave(mode uint8, subject, subcontext, label, userID, sessionID string) error {
	return nk.StreamUserLeaveFn(mode, subject, subcontext, label, userID, sessionID)
}
func (nk *MockNakamaModule) StreamUserKick(mode uint8, subject, subcontext, label string, presence runtime.Presence) error {
	return nk.StreamUserKickFn(mode, subject, subcontext, label, presence)
}
func (nk *MockNakamaModule) StreamCount(mode uint8, subject, subcontext, label string) (int, error) {
	return nk.StreamCountFn(mode, subject, subcontext, label)
}
func (nk *MockNakamaModule) StreamClose(mode uint8, subject, subcontext, label string) error {
	return nk.StreamCloseFn(mode, subject, subcontext, label)
}
func (nk *MockNakamaModule) StreamSend(mode uint8, subject, subcontext, label, data string, presences []runtime.Presence, reliable bool) error {
	return nk.StreamSendFn(mode, subject, subcontext, label, data, presences, reliable)
}
func (nk *MockNakamaModule) StreamSendRaw(mode uint8, subject, subcontext, label string, msg *rtapi.Envelope, presences []runtime.Presence, reliable bool) error {
	return nk.StreamSendRawFn(mode, subject, subcontext, label, msg, presences, reliable)
}
func (nk *MockNakamaModule) SessionDisconnect(ctx context.Context, sessionID string, reason ...runtime.PresenceReason) error {
	return nk.SessionDisconnectFn(ctx, sessionID, reason...)
}
func (nk *MockNakamaModule) SessionLogout(userID, token, refreshToken string) error {
	return nk.SessionLogoutFn(userID, token, refreshToken)
}
func (nk *MockNakamaModule) MatchCreate(ctx context.Context, module string, params map[string]interface{}) (string, error) {
	return nk.MatchCreateFn(ctx, module, params)
}
func (nk *MockNakamaModule) MatchGet(ctx context.Context, id string) (*api.Match, error) {
	return nk.MatchGetFn(ctx, id)
}
func (nk *MockNakamaModule) MatchList(ctx context.Context, limit int, authoritative bool, label string, minSize, maxSize *int, query string) ([]*api.Match, error) {
	return nk.MatchListFn(ctx, limit, authoritative, label, minSize, maxSize, query)
}
func (nk *MockNakamaModule) NotificationSend(ctx context.Context, userID, subject string, content map[string]interface{}, code int, sender string, persistent bool) error {
	return nk.NotificationSendFn(ctx, userID, subject, content, code, sender, persistent)
}
func (nk *MockNakamaModule) NotificationsSend(ctx context.Context, notifications []*runtime.NotificationSend) error {
	return nk.NotificationsSendFn(ctx, notifications)
}
func (nk *MockNakamaModule) WalletUpdate(ctx context.Context, userID string, changeset map[string]int64, metadata map[string]interface{}, updateLedger bool) (map[string]int64, map[string]int64, error) {
	return nk.WalletUpdateFn(ctx, userID, changeset, metadata, updateLedger)
}
func (nk *MockNakamaModule) WalletsUpdate(ctx context.Context, updates []*runtime.WalletUpdate, updateLedger bool) ([]*runtime.WalletUpdateResult, error) {
	return nk.WalletsUpdateFn(ctx, updates, updateLedger)
}
func (nk *MockNakamaModule) WalletLedgerUpdate(ctx context.Context, itemID string, metadata map[string]interface{}) (runtime.WalletLedgerItem, error) {
	return nk.WalletLedgerUpdateFn(ctx, itemID, metadata)
}
func (nk *MockNakamaModule) WalletLedgerList(ctx context.Context, userID string, limit int, cursor string) ([]runtime.WalletLedgerItem, string, error) {
	return nk.WalletLedgerListFn(ctx, userID, limit, cursor)
}
func (nk *MockNakamaModule) StorageList(ctx context.Context, userID, collection string, limit int, cursor string) ([]*api.StorageObject, string, error) {
	return nk.StorageListFn(ctx, userID, collection, limit, cursor)
}
func (nk *MockNakamaModule) StorageRead(ctx context.Context, reads []*runtime.StorageRead) ([]*api.StorageObject, error) {
	return nk.StorageReadFn(ctx, reads)
}
func (nk *MockNakamaModule) StorageWrite(ctx context.Context, writes []*runtime.StorageWrite) ([]*api.StorageObjectAck, error) {
	return nk.StorageWriteFn(ctx, writes)
}
func (nk *MockNakamaModule) StorageDelete(ctx context.Context, deletes []*runtime.StorageDelete) error {
	return nk.StorageDeleteFn(ctx, deletes)
}
func (nk *MockNakamaModule) MultiUpdate(ctx context.Context, accountUpdates []*runtime.AccountUpdate, storageWrites []*runtime.StorageWrite, walletUpdates []*runtime.WalletUpdate, updateLedger bool) ([]*api.StorageObjectAck, []*runtime.WalletUpdateResult, error) {
	return nk.MultiUpdateFn(ctx, accountUpdates, storageWrites, walletUpdates, updateLedger)
}
func (nk *MockNakamaModule) LeaderboardCreate(ctx context.Context, id string, authoritative bool, sortOrder, operator, resetSchedule string, metadata map[string]interface{}) error {
	return nk.LeaderboardCreateFn(ctx, id, authoritative, sortOrder, operator, resetSchedule, metadata)
}
func (nk *MockNakamaModule) LeaderboardDelete(ctx context.Context, id string) error {
	return nk.LeaderboardDeleteFn(ctx, id)
}
func (nk *MockNakamaModule) LeaderboardRecordsList(ctx context.Context, id string, ownerIDs []string, limit int, cursor string, expiry int64) ([]*api.LeaderboardRecord, []*api.LeaderboardRecord, string, string, error) {
	return nk.LeaderboardRecordsListFn(ctx, id, ownerIDs, limit, cursor, expiry)
}
func (nk *MockNakamaModule) LeaderboardRecordWrite(ctx context.Context, id, ownerID, username string, score, subscore int64, metadata map[string]interface{}) (*api.LeaderboardRecord, error) {
	return nk.LeaderboardRecordWriteFn(ctx, id, ownerID, username, score, subscore, metadata)
}
func (nk *MockNakamaModule) LeaderboardRecordDelete(ctx context.Context, id, ownerID string) error {
	return nk.LeaderboardRecordDeleteFn(ctx, id, ownerID)
}
func (nk *MockNakamaModule) PurchaseValidateApple(ctx context.Context, userID, receipt string) (*api.ValidatePurchaseResponse, error) {
	return nk.PurchaseValidateAppleFn(ctx, userID, receipt)
}
func (nk *MockNakamaModule) PurchaseValidateGoogle(ctx context.Context, userID, receipt string) (*api.ValidatePurchaseResponse, error) {
	return nk.PurchaseValidateGoogleFn(ctx, userID, receipt)
}
func (nk *MockNakamaModule) PurchaseValidateHuawei(ctx context.Context, userID, signature, inAppPurchaseData string) (*api.ValidatePurchaseResponse, error) {
	return nk.PurchaseValidateHuaweiFn(ctx, userID, signature, inAppPurchaseData)
}
func (nk *MockNakamaModule) PurchasesList(ctx context.Context, userID string, limit int, cursor string) (*api.PurchaseList, error) {
	return nk.PurchasesListFn(ctx, userID, limit, cursor)
}
func (nk *MockNakamaModule) PurchaseGetByTransactionId(ctx context.Context, transactionID string) (string, *api.ValidatedPurchase, error) {
	return nk.PurchaseGetByTransactionIdFn(ctx, transactionID)
}
func (nk *MockNakamaModule) TournamentCreate(ctx context.Context, id string, sortOrder, operator, resetSchedule string, metadata map[string]interface{}, title, description string, category, startTime, endTime, duration, maxSize, maxNumScore int, joinRequired bool) error {
	return nk.TournamentCreateFn(ctx, id, sortOrder, operator, resetSchedule, metadata, title, description, category, startTime, endTime, duration, maxSize, maxNumScore, joinRequired)
}
func (nk *MockNakamaModule) TournamentDelete(ctx context.Context, id string) error {
	return nk.TournamentDeleteFn(ctx, id)
}
func (nk *MockNakamaModule) TournamentAddAttempt(ctx context.Context, id, ownerID string, count int) error {
	return nk.TournamentAddAttemptFn(ctx, id, ownerID, count)
}
func (nk *MockNakamaModule) TournamentJoin(ctx context.Context, id, ownerID, username string) error {
	return nk.TournamentJoinFn(ctx, id, ownerID, username)
}
func (nk *MockNakamaModule) TournamentsGetId(ctx context.Context, tournamentIDs []string) ([]*api.Tournament, error) {
	return nk.TournamentsGetIdFn(ctx, tournamentIDs)
}
func (nk *MockNakamaModule) TournamentList(ctx context.Context, categoryStart, categoryEnd, startTime, endTime, limit int, cursor string) (*api.TournamentList, error) {
	return nk.TournamentListFn(ctx, categoryStart, categoryEnd, startTime, endTime, limit, cursor)
}
func (nk *MockNakamaModule) TournamentRecordsList(ctx context.Context, tournamentId string, ownerIDs []string, limit int, cursor string, overrideExpiry int64) ([]*api.LeaderboardRecord, []*api.LeaderboardRecord, string, string, error) {
	return nk.TournamentRecordsListFn(ctx, tournamentId, ownerIDs, limit, cursor, overrideExpiry)
}
func (nk *MockNakamaModule) TournamentRecordWrite(ctx context.Context, id, ownerID, username string, score, subscore int64, metadata map[string]interface{}) (*api.LeaderboardRecord, error) {
	return nk.TournamentRecordWriteFn(ctx, id, ownerID, username, score, subscore, metadata)
}
func (nk *MockNakamaModule) TournamentRecordsHaystack(ctx context.Context, id, ownerID string, limit int, expiry int64) ([]*api.LeaderboardRecord, error) {
	return nk.TournamentRecordsHaystackFn(ctx, id, ownerID, limit, expiry)
}
func (nk *MockNakamaModule) GroupsGetId(ctx context.Context, groupIDs []string) ([]*api.Group, error) {
	return nk.GroupsGetIdFn(ctx, groupIDs)
}
func (nk *MockNakamaModule) GroupCreate(ctx context.Context, userID, name, creatorID, langTag, description, avatarUrl string, open bool, metadata map[string]interface{}, maxCount int) (*api.Group, error) {
	return nk.GroupCreateFn(ctx, userID, name, creatorID, langTag, description, avatarUrl, open, metadata, maxCount)
}
func (nk *MockNakamaModule) GroupUpdate(ctx context.Context, id, name, creatorID, langTag, description, avatarUrl string, open bool, metadata map[string]interface{}, maxCount int) error {
	return nk.GroupUpdateFn(ctx, id, name, creatorID, langTag, description, avatarUrl, open, metadata, maxCount)
}
func (nk *MockNakamaModule) GroupDelete(ctx context.Context, id string) error {
	return nk.GroupDeleteFn(ctx, id)
}
func (nk *MockNakamaModule) GroupUserJoin(ctx context.Context, groupID, userID, username string) error {
	return nk.GroupUserJoinFn(ctx, groupID, userID, username)
}
func (nk *MockNakamaModule) GroupUserLeave(ctx context.Context, groupID, userID, username string) error {
	return nk.GroupUserLeaveFn(ctx, groupID, userID, username)
}
func (nk *MockNakamaModule) GroupUsersAdd(ctx context.Context, groupID string, userIDs []string) error {
	return nk.GroupUsersAddFn(ctx, groupID, userIDs)
}
func (nk *MockNakamaModule) GroupUsersKick(ctx context.Context, groupID string, userIDs []string) error {
	return nk.GroupUsersKickFn(ctx, groupID, userIDs)
}
func (nk *MockNakamaModule) GroupUsersPromote(ctx context.Context, groupID string, userIDs []string) error {
	return nk.GroupUsersPromoteFn(ctx, groupID, userIDs)
}
func (nk *MockNakamaModule) GroupUsersDemote(ctx context.Context, groupID string, userIDs []string) error {
	return nk.GroupUsersDemoteFn(ctx, groupID, userIDs)
}
func (nk *MockNakamaModule) GroupUsersList(ctx context.Context, id string, limit int, state *int, cursor string) ([]*api.GroupUserList_GroupUser, string, error) {
	return nk.GroupUsersListFn(ctx, id, limit, state, cursor)
}
func (nk *MockNakamaModule) UserGroupsList(ctx context.Context, userID string, limit int, state *int, cursor string) ([]*api.UserGroupList_UserGroup, string, error) {
	return nk.UserGroupsListFn(ctx, userID, limit, state, cursor)
}
func (nk *MockNakamaModule) FriendsList(ctx context.Context, userID string, limit int, state *int, cursor string) ([]*api.Friend, string, error) {
	return nk.FriendsListFn(ctx, userID, limit, state, cursor)
}
func (nk *MockNakamaModule) Event(ctx context.Context, evt *api.Event) error {
	return nk.Event(ctx, evt)
}
