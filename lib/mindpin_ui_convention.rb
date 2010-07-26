module MindpinUiConvention
  include ActionController::RecordIdentifier

  # 根据传入的模型或模型数组获取mplist的id
  # 传入： <Cooking::ApplePie> 返回 mplist_cooking_apple_pies
  # 传入: [<Book>,<Cooking::ApplePie>] 返回 mplist_book_23_cooking_apple_pies
  # 传入: [:my,<Book>,<Cooking::ApplePie>] 返回 mplist_my_book_23_cooking_apple_pies
  # 如果是数组，组装每个部分并用 _ 连接
  def build_ul_id(ul_selector)
    case ul_selector
      when Class
        # Apple
        build_ul_id_part(ul_selector)
      when ActiveRecord::Base,String,Symbol
        # <Apple id:33>,:haha,'haha',Apple
        build_ul_id_part(ul_selector.class)
      when Array
        # [<Apple id:33>, Foo::Bar]
        array = ul_selector.clone
        last = array.pop
        last = last.class unless last.instance_of?(Class)
        [array,last].flatten.map{|x| build_ul_id_part(x)}*'_'
    end
  end

  # 根据传入的对象或者数组来构建一个用于集合的html_id
  # 此函数用于构建每个部分
  def build_ul_id_part(ul_selector_part)
    case ul_selector_part
    when ActiveRecord::Base
      dom_id(ul_selector_part)
    when Class
      ul_selector_part.name.underscore.pluralize.gsub('/','_')
    when String,Symbol
      ul_selector_part
    end
  end

  # 根据当前的 controller名 和 传入的 model类型 以及子模板前缀 自动获取render_mplist应该使用的子模板
  # 例如：
  # controller: Cooking::ApplePies
  # model: <Cake>
  # prefix: :form
  # => 'cooking/apple_pies/form_cake'
  def get_partial_of(model_or_array,prefix)
    "#{get_path_of_controller}/#{prefix}_#{get_partial_base_name_of_model(model_or_array)}"
  end

  # 根据 controller 获取模板所在目录
  def get_path_of_controller
    begin
      controller.class.name.gsub('Controller','').underscore
    rescue Exception => ex
      self.class.name.gsub('Controller','').underscore # TODO 此行重构后删除
    end

  end

  # 根据 ActiveRecord 模型 获取对应的模板基准名
  def get_partial_base_name_of_model(model)
    model.class.name.demodulize.underscore
  end

  def get_sym_of(model)
    model.class.name.demodulize.underscore.to_sym
  end

  def get_mplist_classname(model_or_array)
    case model_or_array
    when Array
      plural_class_name model_or_array.last
    else
      plural_class_name model_or_array
    end
  end

  # 根据传入的 class 返回对应的局部模板
  def get_partial_of_class(prefix,klass)
    class_name = klass.name
    "#{class_name.underscore.pluralize}/#{prefix}_#{class_name.demodulize.underscore}"
  end
end
