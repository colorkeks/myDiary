module ApplicationHelper
  def calendar(options={}, &block)
    block_given? ? Diary::Calendar.new(self, options).render(&block) : nil
  end
end
