// Типы данных для пользователей

// Ответ с данными пользователя от API
export interface IUserResponse {
  id: string;
  email: string;
  tier_id: string;
  tier_name?: string;
  created_at: string;
}

// Данные для регистрации
export interface IUserRegister {
  email: string;
  password: string;
}

// Данные для входа
export interface IUserLogin {
  email: string;
  password: string;
}

// Данные лимитов пользователя
export interface IUserLimits {
  monthly_token_limit: number;
  balance: number;
}

// Данные профиля с дополнительной информацией
export interface IUserProfile extends IUserResponse {
  limits?: IUserLimits;
} 