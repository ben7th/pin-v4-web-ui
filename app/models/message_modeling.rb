class MessageModeling < ActiveRecord::Base

  belongs_to :message
  belongs_to :model,:polymorphic => true

  validates_presence_of :message
  validates_presence_of :model

  DIRECTLY = "DIRECTLY"
  MODEL_ASSIGN = "MODEL_ASSIGN"
  INHERIT = "INHERIT"
  DEFAULT = "DEFAULT"

  def self.config
    if RAILS_ENV == 'production'
      @@config ||= YAML.load_file("#{RAILS_ROOT}/config/message_modeling_config.yml")
    else
      @@config = YAML.load_file("#{RAILS_ROOT}/config/message_modeling_config.yml")
    end
    @@config
  end

  def self.message_source_type(namespace)
    if(config = self.config[namespace])
      config['source_type']
    else
      '未知'
    end
  end

  def self.get_model_class(namespace)
    self.config[namespace]['model_class'].constantize
  end

  def self.get_form_type(namespace)
    self.config[namespace]['new_form']['type']
  end

  def self.message_receiver_select_mode(namespace)
    if(config = self.config[namespace])
      config['receiver_select_mode']
    else
      DIRECTLY
    end
  end

  def self.children_namespace_init_mode(namespace)
    self.config[namespace]['children_namespace_init_mode']
  end

  module ModelMethods
    def self.included(base)
      base.has_one :message_modeling,:as=>:model
      base.has_one :message,:through=>:message_modeling
      base.extend(ClassMethods)
    end

    def linked_message
      message
    end


    def get_mplist_selector_parts
      raise "Class:#{self} 没有实现get_mplist_selector_parts方法"
    end

    def get_mplist_display_modes
      raise "Class:#{self}没有实现get_mplist_display_modes方法，该方法用来返回这个模型在页面上的显示样式"
    end

    module ClassMethods
      def create_message_linked_model(namespace,params,user)
        raise "Class:#{self} 没有实现create_message_linked_model方法"
      end
    end
  end

  module MessageMethods
    def self.included(base)
      base.has_one :message_modeling
    end

    def linked_model
      message_modeling.model
    end

    def receiver_by_directly?
      receiver_select_mode == MessageModeling::DIRECTLY
    end

    def receiver_by_model_assign?
      receiver_select_mode == MessageModeling::MODEL_ASSIGN
    end

    def receiver_select_mode
      namespace = self.namespace
      if namespace == 'replace'
        namespace = self.parent.namespace
      end
      MessageModeling.message_receiver_select_mode(namespace)
    end

    def source_type
      namespace = self.namespace
      if namespace == 'replace'
        namespace = self.parent.namespace
      end
      MessageModeling.message_source_type(namespace)
    end

  end

end
