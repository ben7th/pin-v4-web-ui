class WorkBoard < ActiveRecord::Base
  belongs_to :user
  has_many :work_board_quotings
  ENTRIES_LIMIT = 20
  has_many :entries,:through=>:work_board_quotings

  # 根据传入的hash来添加或引用entry，可以传入entry_id，也可以直接在此构造entry
  # 此时此方法作为Entry类的代理方法
  def add(hash)
    return false if full?
    if hash[:entry_id]
      return _add_quoting(hash[:entry_id])
    end
    add_new_entry(hash)
  end

  def remove(entry_id)
    wbq = find_quoting_by_work_board_and_entry(entry_id)
    wbq.destroy if wbq
  end

  def add_new_entry(hash)
    entry = Entry.new(hash)
    entry.user_id = self.user_id
    return false if !entry.valid?
    entry.save
    self.entries << entry
    return true
  end

  def _add_quoting(entry_id)
    wq = find_quoting_by_work_board_and_entry(entry_id)
    return wq.update_attributes(:updated_at=>Time.now) if wq
    entry = Entry.find(entry_id)
    self.entries << entry
    return true
  end

  # 根据work_board和entry找到他所对应的quoting
  def find_quoting_by_work_board_and_entry(entry_id)
    WorkBoardQuoting.find_by_work_board_id_and_entry_id(self.id,entry_id)
  end

  def full?
    self.entries.count >= WorkBoard::ENTRIES_LIMIT
  end
end