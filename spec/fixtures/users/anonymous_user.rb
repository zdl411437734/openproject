RSpec.shared_context 'shared anonymous user' do
  before(:all) do
    @fixture_shared_anonymous = TestProf::AnyFixture.register(:anonymous) do
      FactoryBot.create(:anonymous)
    end
  end

  let(:anonymous) { TestProf::AnyFixture.register(:anonymous) }
end
