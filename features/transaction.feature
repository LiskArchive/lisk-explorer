Feature: Transaction page
  
  Scenario: should show title, summary, and details
    Given I'm on page "/tx/1465651642158264047"
    Then I should see "Transaction 1465651642158264047 " in "h1" html element
    And I should see "Home Transaction 1465651642158264047" in "breadcrumb" element
    And I should see table "summary" containing:
      | Sender        | 1085993630748340485L      |
      | Recipient     | 16313739661670634666L     |
      | Confirmations | /\d+/                     |
      | Amount        | 100,000,000 LSK           |
      | Fee           | 0 LSK                     |
      | Timestamp     | /2016\/05\/24 \d\d:00:00/ |
      | Block         | 6524861224470851795       |

  Scenario: should link added votes to address page
    Given I'm on page "/tx/9211700107174373690"
    And I should see "genesis_18 • genesis_33 • genesis_11 • genesis_26 • genesis_37 • genesis_60 • genesis_83 • genesis_21 • genesis_92 • genesis_49 • genesis_54 • genesis_41 • genesis_4 • genesis_28 • genesis_30 • genesis_5 • genesis_8 • genesis_85 • genesis_38 • genesis_55 • genesis_71 • genesis_82 • genesis_25 • genesis_74 • genesis_3 • genesis_80 • genesis_53 • genesis_12 • genesis_2 • genesis_1 • genesis_84 • genesis_69 • genesis_10" in "added votes" element
    And I click "vote added link" no. 1
    Then I should be on page "/address/11194005483892021001L"

  Scenario: should link deleted votes to address page
    Given I'm on page "/tx/11267727202420741572"
    And I should see "genesis_51 • genesis_2 • genesis_7 • genesis_3 • genesis_4 • genesis_5 • genesis_6 • genesis_8 • genesis_9 • genesis_10 • genesis_11" in "deleted votes" element
    And I click "vote deleted link" no. 1
    Then I should be on page "/address/2581762640681118072L"

  Scenario: should show transactions list
      Given I'm on page "/txs/"
      Then I should see "Transactions" in "h1" html element
      And I should see "Home Transactions" in "breadcrumb" element
      And I should see table "transactions" with 50 rows starting with:
      | Transaction ID | Date                          | Sender                   | Recipient        | Amount           | Fee     | Confirm.  |
      |----------------|-------------------------------|--------------------------|------------------|------------------|---------|-----------|
      | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |       123.45 LSK | 0.1 LSK | 5 / 101   |
      | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |          100 LSK | 0.1 LSK | 6 / 101   |
      | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account | 100.12345678 LSK | 0.1 LSK | 7 / 101   |
      | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |     0.123456 LSK | 0.1 LSK | 8 / 101   |
      | /\d{18,20}/    | /2017\/06\/19 \d\d:\d\d:\d\d/ | /standby_\d{3}\|\d{20}L/ | Explorer Account |     123.4567 LSK | 0.1 LSK | 9 / 101   |

  Scenario: should allow to load more transactions
    Given I'm on page "/txs/"
    And I should see table "transactions" with 50 rows
    When I scroll to "more button"
    And I click "more button"
    Then I should see table "transactions" with 100 rows
