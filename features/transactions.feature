Feature: Transactions page
  Scenario: should show title, summary, and transactions
    Given I'm on page "/txs/"
    Then I should see "Transactions" in "h1" html element
    And I should see "Home Transactions" in "breadcrumb" element
    And I should see table "transactions table" with 20 rows starting with:
    | Transaction ID | Date                          | Sender                   | Recipient        | Amount           | Fee     | Confirm.  |
    |----------------|-------------------------------|--------------------------|------------------|------------------|---------|-----------|
    | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |       123.45 LSK | 0.1 LSK | 5 / 101   |
    | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |          100 LSK | 0.1 LSK | 6 / 101   |
    | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account | 100.12345678 LSK | 0.1 LSK | 7 / 101   |
    | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |     0.123456 LSK | 0.1 LSK | 8 / 101   |
    | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |     123.4567 LSK | 0.1 LSK | 9 / 101   |

  Scenario: By clicking 2 should go to page 2 
    Given I'm on page "/txs/"
    When I click "nav item" no. 2
    Then I should be on page "/txs/2"

  Scenario: By clicking 1 should go to page 1 
    Given I'm on page "/txs/"
    When I click "nav item" no. 1
    Then I should be on page "/txs/1"

  Scenario: By clicking next button should go to page 2 
    Given I'm on page "/txs/1"
    When I click "btn next"
    Then I should be on page "/txs/2"

  Scenario: By clicking previous button should go to page 1 
    Given I'm on page "/txs/2"
    When I click "btn prev"
    Then I should be on page "/txs/1"

