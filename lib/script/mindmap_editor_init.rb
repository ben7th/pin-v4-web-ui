class MindmapEditorInit < ActiveRecord::Base

  def self.create_or_find_mindmap_editor

    mindmap_editor = "mindmap_editor"
    callback_url = ""
    title = "思维导图"
    developer = "MindPin Team"
    callback_url = "http://192.168.1.8:9528"
    port = "80"
    subject = "思维导图的说明"

    app = App.find_by_name("mindmap_editor")

    if app.blank?
      app = App.create!(:name=>mindmap_editor,
        :title=>title,:developer=>developer,
        :callback_url=>callback_url,
        :port=>port,
        :subject=>subject
      )
      p "create mindmap_editor"
    end

    return app
  end

  def self.install_mindpin_editor_to_all_users
    app = create_or_find_mindmap_editor
    User.all.each do |user|
      if !user.apps.include?(app)
        Installing.create!(:app=>app,:user=>user)
      end
    end
    p "install mindmap_editor for #{User.all.count} user"
  end

  def self.set_mindpin_editor_to_default_app
    app = create_or_find_mindmap_editor
    User.all.each do |user|
      user.default_app_id = app.id
    end
    p "set mindmap_editor to default_app for #{User.all.count} user"
  end

  def self.set_mindpin_editor_to_usually_used_app
    app = create_or_find_mindmap_editor
    User.all.each do |user|
      set_installing = user.installings.find_by_app_id(app.id)
      set_installing.update_attributes(:usually_used=>true)
    end
    p "set mindmap_editor to usually_used_app for #{User.all.count} user"
  end

  MindmapEditorInit.transaction do
    self.install_mindpin_editor_to_all_users
    self.set_mindpin_editor_to_default_app
    self.set_mindpin_editor_to_usually_used_app
  end
end