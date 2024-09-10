type User = {
  id?:                     number
  createdAt?:              Date
  updatedAt?:              Date
  login_id?:               string
  email_address?:          string
  password?:               string
  name?:                   string
  authority_id?:           number
  password_reset_token?:   string
  password_reset_expires?: Date
}

export default User;