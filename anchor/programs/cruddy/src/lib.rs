#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("BV9YoLajPUZxnEpXDECYCxNLZzAP2J98E3Wd6AuNmn91");

#[program]
pub mod cruddy {
    use super::*;

  //initialize diary entry account
  pub fn create_diary_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
    let diary_entry = &mut ctx.accounts.diary_entry;
    diary_entry.owner = *ctx.accounts.owner.key;
    diary_entry.title = title;
    diary_entry.message = message;

    Ok(())
  }

  pub fn update_diary_entry(ctx: Context<UpdateEntry>, _title:String, message: String) -> Result<()> {
    let diary_entry = &mut ctx.accounts.diary_entry;
    diary_entry.message = message;

    Ok(())
  }

  pub fn delete_diary_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
    //account handling takes place in data structure
    Ok(())
  }
}

#[derive(Accounts)]
//grab title from instruction
#[instruction(title: String)]
pub struct CreateEntry<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    space = 8 + DiaryEntryState::INIT_SPACE,
    payer = owner,
  )]
  //naming acount
  pub diary_entry: Account<'info, DiaryEntryState>,

  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    //extending and reducing message will also change price of storage(extra fee or refund some)
    realloc = 8 + DiaryEntryState::INIT_SPACE,
    realloc::payer = owner,
    //reset original calc of space then recalculate
    realloc::zero = true,
  )]
  pub diary_entry: Account<'info, DiaryEntryState>,

  //pass account through
  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    //close account if pub key matches signers key
    close = owner,
  )]
  pub dairy_entry: Account<'info, DiaryEntryState>,

  #[account(mut)]
  //specify owner
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct DiaryEntryState {
  pub owner: Pubkey,
  #[max_len(50)]
  pub title: String,
  #[max_len(1000)]
  pub message: String,
}