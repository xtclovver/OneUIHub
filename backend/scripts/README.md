# Скрипты базы данных OneUIHub

## Порядок выполнения

1. **Создание базы данных**
   ```sql
   CREATE DATABASE oneui_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE oneui_hub;
   ```

2. **Создание таблиц**
   ```bash
   mysql -u username -p oneui_hub < create_database.sql
   ```

3. **Инициализация базовых данных**
   ```bash
   mysql -u username -p oneui_hub < init_data.sql
   ```

## Описание файлов

- `create_database.sql` - Создание всех таблиц в правильном порядке
- `init_data.sql` - Инициализация базовых данных (тарифы, компании, администратор)

## Важные замечания

- Порядок создания таблиц критически важен из-за внешних ключей
- Таблица `tiers` должна быть создана первой
- Таблица `companies` должна быть создана перед `models`
- Таблица `users` создается после `tiers`

## Администратор по умолчанию

- Email: `admin@oneui-hub.com`
- Пароль: `admin123`
- Роль: `admin`
- Тариф: `Enterprise`

**Обязательно смените пароль после первого входа!**

## Миграции

Для будущих изменений схемы БД создавайте файлы миграций в папке `migrations/` с именованием:
- `001_initial_schema.sql`
- `002_add_new_table.sql`
- и т.д. 