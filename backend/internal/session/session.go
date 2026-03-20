package session

type Session struct {
	Code string
	Owner *User
	Users map[string] *User
	Timer *Timer
	Perms bool 
}