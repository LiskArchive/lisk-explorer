Feature: Cookies information box
  Scenario: should be able to close before starting tests
    Given I'm on page "/"
		And I click "accept-cookies"
    Then I should see "website link" element that links to "https://lisk.io/"

