import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  KeyIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  getUserInfo,
  createUserKey,
  updateUserKey,
  deleteUserKey,
  formatCurrency,
  formatNumber,
  formatDate,
} from '../../api/admin';
import { UserInfo, UserKey, CreateUserKeyRequest, UpdateUserKeyRequest } from '../../types/admin';

interface UsersManagementProps {
  onClose?: () => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ onClose }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<UserKey | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserInfo();
      setUserInfo(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (data: CreateUserKeyRequest) => {
    try {
      await createUserKey(data);
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании ключа');
    }
  };

  const handleUpdateKey = async (keyId: string, data: UpdateUserKeyRequest) => {
    try {
      await updateUserKey(keyId, data);
      setShowEditModal(false);
      setSelectedKey(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении ключа');
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    
    try {
      await deleteUserKey(keyToDelete);
      setShowDeleteModal(false);
      setKeyToDelete(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении ключа');
    }
  };

  const openDeleteModal = (keyId: string) => {
    setKeyToDelete(keyId);
    setShowDeleteModal(true);
  };

  const getKeyStatus = (key: UserKey) => {
    if (key.blocked) return { status: 'blocked', label: 'Заблокирован', color: 'red' };
    if (key.expires && new Date(key.expires) < new Date()) return { status: 'expired', label: 'Истек', color: 'red' };
    if (key.max_budget && key.spend >= key.max_budget) return { status: 'budget_exceeded', label: 'Превышен бюджет', color: 'orange' };
    return { status: 'active', label: 'Активен', color: 'green' };
  };

  const renderUserKeys = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Ключи пользователей</h3>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Обновить
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Создать ключ
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {userInfo?.keys.map((key) => {
            const status = getKeyStatus(key);
            return (
              <li key={key.token} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-900">{key.key_alias}</h4>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Ключ: {key.key_name}</span>
                        <span>Пользователь: {key.user_id}</span>
                        {key.team_alias && <span>Команда: {key.team_alias}</span>}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span>Потрачено: {formatCurrency(key.spend)}</span>
                        {key.max_budget && (
                          <span>Бюджет: {formatCurrency(key.max_budget)}</span>
                        )}
                        {key.expires && (
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Истекает: {formatDate(key.expires)}
                          </span>
                        )}
                      </div>

                      {(key.tpm_limit || key.rpm_limit) && (
                        <div className="flex items-center space-x-4 mt-1">
                          {key.tpm_limit && <span>TPM лимит: {formatNumber(key.tpm_limit)}</span>}
                          {key.rpm_limit && <span>RPM лимит: {formatNumber(key.rpm_limit)}</span>}
                        </div>
                      )}

                      <div className="mt-1">
                        <span>Модели: {key.models.length > 0 ? key.models.join(', ') : 'Все модели'}</span>
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Создан: {formatDate(key.created_at)}</span>
                        <span>Обновлен: {formatDate(key.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedKey(key);
                        setShowDetailsModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKey(key);
                        setShowEditModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(key.token)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  const renderUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Всего ключей
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userInfo?.keys.length || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Активных ключей
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userInfo?.keys.filter(key => getKeyStatus(key).status === 'active').length || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">💰</div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Общие расходы
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(userInfo?.keys.reduce((sum, key) => sum + key.spend, 0) || 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Загрузка */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Загрузка...</span>
        </div>
      ) : (
        userInfo && (
          <>
            {renderUserStats()}
            {renderUserKeys()}
          </>
        )
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Удалить ключ
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Вы уверены, что хотите удалить этот API ключ? Это действие нельзя отменить.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setKeyToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteKey}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 