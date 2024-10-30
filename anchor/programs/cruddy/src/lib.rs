#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod cruddy {
    use super::*;

  pub fn close(_ctx: Context<CloseCruddy>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.cruddy.count = ctx.accounts.cruddy.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.cruddy.count = ctx.accounts.cruddy.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeCruddy>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.cruddy.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeCruddy<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Cruddy::INIT_SPACE,
  payer = payer
  )]
  pub cruddy: Account<'info, Cruddy>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseCruddy<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub cruddy: Account<'info, Cruddy>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub cruddy: Account<'info, Cruddy>,
}

#[account]
#[derive(InitSpace)]
pub struct Cruddy {
  count: u8,
}
