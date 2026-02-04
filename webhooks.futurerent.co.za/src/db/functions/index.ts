// 🚀 Trigger: Set account_name on INSERT
export const createSetAccountNameTrigger = `
  CREATE TRIGGER set_account_name_trigger
  BEFORE INSERT ON customers
  FOR EACH ROW
  BEGIN
    SET NEW.account_name = CONCAT(NEW.first_name, ' ', NEW.last_name);
  END;
`;

// 🚀 Trigger: Update account_name on UPDATE
export const createUpdateAccountNameTrigger = `
  CREATE TRIGGER update_account_name_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW
  BEGIN
    SET NEW.account_name = CONCAT(NEW.first_name, ' ', NEW.last_name);
  END;
`;

// 🧹 Drop triggers
export const dropSetAccountNameTrigger = `
  DROP TRIGGER IF EXISTS set_account_name_trigger;
`;

export const dropUpdateAccountNameTrigger = `
  DROP TRIGGER IF EXISTS update_account_name_trigger;
`;


// 🚀 Trigger: Auto-set title based on married_status and gender
export const createSetTitleTrigger = `
  CREATE TRIGGER set_title_trigger
  BEFORE INSERT ON customers
  FOR EACH ROW
  BEGIN
    IF NEW.gender = 'male' THEN
      SET NEW.title = 'Mr';
    ELSEIF NEW.gender = 'female' THEN
      IF NEW.married_status = 'married' THEN
        SET NEW.title = 'Mrs';
      ELSE
        SET NEW.title = 'Ms';
      END IF;
    END IF;
  END;
`;

export const createUpdateTitleTrigger = `
  CREATE TRIGGER update_title_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW
  BEGIN
    IF NEW.gender = 'male' THEN
      SET NEW.title = 'Mr';
    ELSEIF NEW.gender = 'female' THEN
      IF NEW.married_status = 'married' THEN
        SET NEW.title = 'Mrs';
      ELSE
        SET NEW.title = 'Ms';
      END IF;
    END IF;
  END;
`;

export const dropSetTitleTrigger = `DROP TRIGGER IF EXISTS set_title_trigger;`;
export const dropUpdateTitleTrigger = `DROP TRIGGER IF EXISTS update_title_trigger;`;

