Feature: Top menu
  Scenario: should allow to find a block by id
    Given I'm on page "/"
    And I fill in "6524861224470851795" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    And I wait 1 seconds
    Then I should be on page "/block/6524861224470851795"

  Scenario: should allow to find a transaction by id
    Given I'm on page "/"
    And I fill in "1465651642158264047" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    And I wait 1 seconds
    Then I should be on page "/tx/1465651642158264047"

  Scenario: should allow to find an account by address
    Given I'm on page "/"
    And I fill in "16313739661670634666L" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    Then I should be on page "/address/16313739661670634666L"

  Scenario: should allow to find a delegate by username
    Given I'm on page "/"
    And I fill in "genesis_17" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    And I wait 1 seconds
    Then I should be on page "/address/537318935439898807L"

  Scenario: should allow to show a delegate list
    Given I'm on page "/"
    And I fill in "genesis" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    And I wait 1 seconds
    And I click "search suggestion item" #1 in "desktop search" div
    Then I should be on page "/address/12254605294831056546L"

  Scenario: should show an error message on invalid input
    Given I'm on page "/"
    And I fill in "invalid" to "search" field in "desktop search" div
    And I hit "enter" in "search" field in "desktop search" div
    And I wait 1 seconds
    Then I should see "No matching records found!" in ".desktop-search .empty-result-title" html element

  Scenario: should link Transactions to Transactions page.
    Given I'm on page "/"
    When I click "transaction browser"
    Then I should be on page "/txs/"

  Scenario: should link Blocks to Blocks page.
    Given I'm on page "/"
    When I click "block browser"
    Then I should be on page "/blocks/"
  
  Scenario: should link  Delegates to  Delegates page.
    Given I'm on page "/"
    When I click "delegate monitor"
    Then I should be on page "/delegateMonitor"
  
  Scenario: should link  Delegates to  Delegates page.
    Given I'm on page "/"
    When I click "network monitor"
    Then I should be on page "/networkMonitor"
