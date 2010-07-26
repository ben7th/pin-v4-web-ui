# 此处是俺封装的用于省略rjs调用的渲染器
# 用在controller里头
module MplistRender

  def render_mplist(*args,&block)
    model_or_hash_or_array = args.first # <-- 此处要先取出来，因为接下来args会改变
    options = args.extract_options!
    
    options[:locals] ||={}

    action_sym = action_name.to_sym
    if options[:create] || options[:destroy] || options[:update] || options[:new] ||
        [:create,:destroy,:update,:new].include?(action_sym)
      case model_or_hash_or_array
      when Hash
        selector,operation = options[:create],:insert if options[:create]
        selector,operation = options[:destroy],:remove if options[:destroy]
        selector,operation = options[:update],:update if options[:update]
        selector,operation = options[:new],:new if options[:new]
      when ActiveRecord::Base,Array
        selector,operation = model_or_hash_or_array,:insert if action_sym == :create
        selector,operation = model_or_hash_or_array,:remove if action_sym == :destroy
        selector,operation = model_or_hash_or_array,:update if action_sym == :update
        selector,operation = model_or_hash_or_array,:new if action_sym == :new
      end
      
      render_ui do |ui|
        ui.mplist(operation,selector,options)
        yield(ui.page) if block_given?
      end
      return
    end

    case model_or_hash_or_array
    when Hash
      render_mplist_edit(options,&block) if options[:edit]
      render_mplist_update(options,&block) if options[:update]
    when ActiveRecord::Base,Array
      options[action_name.to_sym] = model_or_hash_or_array
      eval "render_mplist_#{action_name}(options,&block)"
    else
      raise 'render_mplist() 方法没有传入有效的对象'
    end
  end

  # 根据传入的模型或模型数组获取mplist的id
  # 传入： <Cooking::ApplePie> 返回 mplist_cooking_apple_pies
  # 传入: [<Book>,<Cooking::ApplePie>] 返回 mplist_book_23_cooking_apple_pies
  # 传入: [:my,<Book>,<Cooking::ApplePie>] 返回 mplist_my_book_23_cooking_apple_pies
  def get_mplist_id_of(model_or_array)
    case model_or_array
    when Array
      array = model_or_array.clone
      last = array.pop
      return "mplist_#{build_collection_id [array,last.class].flatten}"
    else
      return "mplist_#{build_collection_id [model_or_array.class].flatten}"
    end
  end

  def render_mplist_edit(options)
    model = get_model_from_model_or_array options[:edit]
    html_id = dom_id model
    html_partten = '.mplist #'+html_id
    partial = options[:partial] || get_partial_of(model,:form)
    render :update do |page|
      str = (render :partial=>partial,:locals=>{get_sym_of(model)=>model}.merge(options[:locals]))
      page<< %~
        var li = $$('#{html_partten}')[0];
        pie.mplist.open_edit_form(li,#{str.to_json});
      ~
      yield(page) if block_given?
    end
  end

  # 参数处理方法，获取数组中最后一个对象，或直接返回对象
  def get_model_from_model_or_array(model_or_array)
    case model_or_array
    when ActiveRecord::Base
      model_or_array
    when Array
      model_or_array.last
    end
  end

#  # 根据当前的 controller名 和 传入的 model类型 以及子模板前缀 自动获取render_mplist应该使用的子模板
#  # 例如：
#  # controller: Cooking::ApplePies
#  # model: <Cake>
#  # prefix: :form
#  # => 'cooking/apple_pies/form_cake'
#  def get_partial_of(model_or_array,prefix)
#    case model_or_array
#    when ActiveRecord::Base
#      "#{get_path_of_controller}/#{prefix}_#{get_partial_name_of_model(model_or_array)}"
#    when Array
#      "#{get_path_of_controller}/#{prefix}_#{get_partial_name_of_model(model_or_array.last)}"
#    end
#  end
#
#  def get_path_of_controller(controller = nil)
#    if(controller.nil?)
#      self.class.name.gsub('Controller','').underscore
#    else
#      controller.class.name.gsub('Controller','').underscore
#    end
#  end
end
