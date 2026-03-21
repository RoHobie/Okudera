package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/RoHobie/Okudera/backend/internal/types"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type CreateSessionRequest struct {
	Name string `json:"name"`
}

type CreateSessionResponse struct {
	Code   string `json:"code"`
	UserID string `json:"user_id"`
}

type JoinSessionRequest struct {
	Name string `json:"name"`
}

type JoinSessionResponse struct {
	Code   string `json:"code"`
	UserID string `json:"user_id"`
}

func CreateSessionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req CreateSessionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		owner := &types.User{UserID: uuid.New(), Name: req.Name}
		sess := types.NewSession(owner)
		store.Add(sess)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CreateSessionResponse{
			Code:   sess.Code,
			UserID: owner.UserID.String(),
		})
	}
}

func JoinSessionHandler(store *types.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := chi.URLParam(r, "code")

		sess, ok := store.Get(code)
		if !ok {
			http.Error(w, "session not found", http.StatusNotFound)
			return
		}

		var req JoinSessionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		user := &types.User{UserID: uuid.New(), Name: req.Name}
		sess.AddUser(user)

		sess.Publish(types.Event{
			Type: "user_joined",
			Data: map[string]string{"name": user.Name, "user_id": user.UserID.String()},
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(JoinSessionResponse{
			Code:   code,
			UserID: user.UserID.String(),
		})
	}
}
