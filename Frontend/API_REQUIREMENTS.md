# API Endpoints Needed

## Base URL

- Development: `http://localhost:8000`

## Endpoints Required

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Trading

- `GET /trades` - Get user trades
- `POST /trades` - Create new trade

### User

- `GET /user/profile` - Get user profile

## Notes

- Frontend runs on port 3000
- Backend needs CORS enabled for `http://localhost:3000`
