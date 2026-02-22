# frozen_string_literal: true

class AuditBlueprint < Blueprinter::Base
  identifier :id

  fields :action, :created_at

  field :changes do |audit|
    audit.audited_changes
  end
end
