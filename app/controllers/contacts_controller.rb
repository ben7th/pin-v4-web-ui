class ContactsController < ApplicationController

  def show
    @contacts = current_user.contactings.map{|c| c.contact}.compact
  end

  def find
    @contacts ||= []
    if params[:q]
      @contacts = User.find(:all,:conditions=>[' name like ? ',"%#{params[:q]}%"])
    end
    @contacts.delete(current_user)
    @contacts.compact
  end

  def edit
    @contacts = current_user.contacting
    @contacters = current_user.contacters
  end
end