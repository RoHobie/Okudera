package types

import "github.com/google/uuid"

type User struct {
	UserID uuid.UUID
	Name   string
}
