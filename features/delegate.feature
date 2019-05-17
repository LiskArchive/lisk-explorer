Feature: Delegate page
  Scenario: should show title, summary
    Given I'm on page "/delegate/537318935439898807L"
    Then I should see "Delegate summary" in "h1" html element
    And I should see "Home Delegate 537318935439898807L" in "breadcrumb" element
    And I should see table "summary" containing:
      | Name          | genesis_17                |
      | Address       | 537318935439898807L       |
      | Uptime        | /\d{1,3}(\.\d\d)?%/       |
      | Rank / Status | 50 / Active               |
      | Approval      | /\d{1,3}(\.\d\d)?%/       |
      | Vote weight   | /99(,\d{3})*.\d{1,8} LSK/ |
      | Forged        | /1,\d{3}.\d{8} LSK/       |
      | Blocks        | /\d+ \(\d+ missed\)/      |

  Scenario: should link address to address page
    Given I'm on page "/delegate/4401082358022424760L"
    And I click link on row no. 2 cell no. 2 of "summary" table
    Then I should be on page "/address/4401082358022424760L"
    