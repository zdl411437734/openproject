# before_all / let_it_be fixture
require 'test_prof/recipes/rspec/before_all'
# Define factories as fixtures and re-use within transaction
require 'test_prof/recipes/rspec/any_fixture'

# Some syntactic sugar to use and re-use fixtures
require 'test_prof/any_fixture/dsl'
using TestProf::AnyFixture::DSL
