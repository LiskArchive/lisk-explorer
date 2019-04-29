Feature: Tools menu
  Scenario: should allow to go to "Top Accounts"
    Given I'm on page "/"
    When I click "tools menu" no. 1
    And I click "top accounts" no. 1
    Then I should be on page "/topAccounts"

  Scenario: should allow to go to "Activity Graph"
    Given I'm on page "/topAccounts"
    When I click "tools menu" no. 1
    And I click "activity graph" no. 1
    Then I should be on page "/activityGraph"

  Scenario: should allow to go to "Delegate Monitor"
    Given I'm on page "/activityGraph"
    When I click "tools menu" no. 1
    And I click "delegate monitor" no. 1
    Then I should be on page "/delegateMonitor"

  Scenario: should allow to go to "Market Watcher"
    Given I'm on page "/delegateMonitor"
    When I click "tools menu" no. 1
    And I click "market watcher" no. 1
    Then I should be on page "/marketWatcher"

  Scenario: should allow to go to "Nework Monitor"
    Given I'm on page "/marketWatcher"
    When I click "tools menu" no. 1
    And I click "network monitor" no. 1
    Then I should be on page "/networkMonitor"
