class AddDeletedAtToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :deleted_at, :datetime, null: true
  end
end
