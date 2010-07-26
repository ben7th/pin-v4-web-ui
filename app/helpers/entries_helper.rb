module EntriesHelper
  def file_entry_type(file_entry)
    return "<span>#{file_entry.file_type}</span>"
  end
end