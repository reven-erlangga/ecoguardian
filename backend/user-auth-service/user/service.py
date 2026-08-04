from user import repository


def create_user(email: str, username: str, password_hash: str) -> dict:
    return repository.create_user(email, username, password_hash)


def get_user(id: str) -> dict | None:
    return repository.get_user(id)


def get_user_by_email(email: str) -> dict | None:
    return repository.get_user_by_email(email)


def update_user(id: str, email: str, username: str) -> dict | None:
    return repository.update_user(id, email, username)


def count_users() -> int:
    return repository.count_users()
