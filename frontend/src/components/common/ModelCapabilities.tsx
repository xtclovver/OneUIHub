import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon,
  GlobeAltIcon,
  CpuChipIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Model } from '../../types';

interface ModelCapabilitiesProps {
  model: Model;
}

interface Capability {
  key: keyof Model;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

const capabilities: Capability[] = [
  {
    key: 'supports_vision',
    label: 'Поддержка изображений',
    icon: EyeIcon,
    description: 'Модель может анализировать и описывать изображения'
  },
  {
    key: 'supports_web_search',
    label: 'Веб поиск',
    icon: GlobeAltIcon,
    description: 'Модель может выполнять поиск информации в интернете'
  },
  {
    key: 'supports_function_calling',
    label: 'Вызов функций',
    icon: WrenchScrewdriverIcon,
    description: 'Модель поддерживает вызов внешних функций и API'
  },
  {
    key: 'supports_parallel_function_calling',
    label: 'Параллельные функции',
    icon: CpuChipIcon,
    description: 'Модель может вызывать несколько функций одновременно'
  },
  {
    key: 'supports_reasoning',
    label: 'Аналитическое мышление',
    icon: LightBulbIcon,
    description: 'Модель обладает продвинутыми способностями к рассуждению'
  }
];

const ModelCapabilities: React.FC<ModelCapabilitiesProps> = ({ model }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Функция для проверки поддержки возможности
  const isSupported = (capability: Capability): boolean => {
    const value = model[capability.key];
    return Boolean(value);
  };

  // Функция для получения провайдеров
  const getProviders = (): string[] => {
    if (!model.providers) return [];
    try {
      return JSON.parse(model.providers);
    } catch {
      return [];
    }
  };

  const providers = getProviders();

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Провайдеры */}
      {providers.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CpuChipIcon className="w-5 h-5 mr-2 text-ai-orange" />
            Провайдеры
          </h3>
          <div className="flex flex-wrap gap-2">
            {providers.map((provider, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-ai text-white font-medium"
              >
                {provider}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Технические характеристики */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Технические характеристики
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {model.max_input_tokens && (
            <div className="glass-card p-4">
              <div className="text-sm text-ai-gray-400 mb-1">Максимум входных токенов</div>
              <div className="text-lg font-semibold text-gray-900">
                {model.max_input_tokens.toLocaleString()}
              </div>
            </div>
          )}
          {model.max_output_tokens && (
            <div className="glass-card p-4">
              <div className="text-sm text-ai-gray-400 mb-1">Максимум выходных токенов</div>
              <div className="text-lg font-semibold text-gray-900">
                {model.max_output_tokens.toLocaleString()}
              </div>
            </div>
          )}
          {model.mode && (
            <div className="glass-card p-4">
              <div className="text-sm text-ai-gray-400 mb-1">Режим</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {model.mode}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Возможности */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Возможности модели
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((capability) => {
            const supported = isSupported(capability);
            const IconComponent = capability.icon;
            
            return (
              <motion.div
                key={capability.key}
                className={`glass-card p-4 transition-all duration-300 ${
                  supported 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    supported ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      supported ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {capability.label}
                      </h4>
                      {supported ? (
                        <CheckIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <XMarkIcon className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-ai-gray-400">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Поддерживаемые параметры OpenAI */}
      {model.supported_openai_params && (
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Поддерживаемые параметры OpenAI API
          </h3>
          <div className="glass-card p-4">
            <div className="flex flex-wrap gap-2">
              {(() => {
                try {
                  const params = JSON.parse(model.supported_openai_params);
                  return params.map((param: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-ai-gray-700 text-ai-gray-300 font-mono"
                    >
                      {param}
                    </span>
                  ));
                } catch {
                  return (
                    <span className="text-ai-gray-400 text-sm">
                      Не удалось загрузить параметры
                    </span>
                  );
                }
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ModelCapabilities; 