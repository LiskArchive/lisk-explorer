Feature: Home page
  Scenario: should show the title
    Given I'm on page "/"
    Then I should see "Lisk Blockchain Explorer" in "h1" html element no. 1

  Scenario: should show latest transactions
    Given I'm on page "/"
    Then I should see table "latest transactions" with 10 rows starting with:
      | Id                   | Timestamp                 | Sender      | Recipient             | Amount           | Fee     |
      |----------------------|---------------------------|-------------|-----------------------|------------------|---------|
      | 292176566870988581   | /2017\/06\/19 \d\d:18:09/ | standby_301 | Explorer Account      |       123.45 LSK | 0.1 LSK |
      | 4629979183209290127  | /2017\/06\/19 \d\d:17:59/ | standby_301 | Explorer Account      |          100 LSK | 0.1 LSK |
      | 16747360986039780565 | /2017\/06\/19 \d\d:17:49/ | standby_301 | Explorer Account      | 100.12345678 LSK | 0.1 LSK |
      | 2799279669192005501  | /2017\/06\/19 \d\d:17:39/ | standby_301 | Explorer Account      |     0.123456 LSK | 0.1 LSK |
      | 4146285315366899005  | /2017\/06\/19 \d\d:17:29/ | standby_301 | Explorer Account      |     123.4567 LSK | 0.1 LSK |
  
  Scenario: should show delegates, peers, last block, latest blocks
    Given I'm on page "/"
    And I should see "delegates" element with content that matches:
      """
      DELEGATES
      101 active delegates
      of all 403 delegates
      302 inactive delegates
      """
    And I should see "peers" element with content that matches:
      """
      PEERS
      0 connected peers
      0 disconnected peers
      0 peers in total
      """    
    And I should see "last block" element with content that matches:
      """
      LAST BLOCK
      10045158952652080687 
      Forged by genesis_42
      5 LSK forged
      from 0 transactions
      """
    And I should see "latest blocks" element with content that matches:
      """
      LASTEST BLOCKS
      10925019339842276691 
      12888533172885756103 
      12344091314079488228 
      5345792228665080891
      more blocks
      """

  # TODO: doesn't got to transactions page
  @ignore 
  Scenario: should link More Transactions to Transactions page
    Given I'm on page "/"
    When I click "more transactions"
    Then I should be on page "/txs/"

  @ignore
  Scenario: links to all blocks
    Given I'm on page "/"
    And I click "see all blocks"
    Then I should be on page "/blocks/"
