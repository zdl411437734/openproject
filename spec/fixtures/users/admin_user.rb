RSpec.shared_context 'shared fixture: admin + admin_password' do
  before(:all) do
    @fixture_shared_admin_password = 'admin!' * 4
    @fixture_shared_admin = TestProf::AnyFixture.register(:admin) do
      let(:admin) do
        FactoryBot.create :admin,
                          password: @fixture_shared_admin_password,
                          password_confirmation: @fixture_shared_admin_password_password
      end
    end
  end

  let(:admin_password) { @fixture_shared_admin_password }
  let(:admin) { TestProf::AnyFixture.register(:admin) }
end
