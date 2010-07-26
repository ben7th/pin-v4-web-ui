class AddShowTooltipToPreferences < ActiveRecord::Migration
  def self.up
    add_column :preferences,:show_tooltip,:boolean,:default=>true
  end

  def self.down
  end
end
