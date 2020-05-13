import asyncio
import discord
from discord.ext import commands
import logging

import config
import grouping
import ddc

bot = commands.Bot(command_prefix = config.prefix,
                           description=config.description)

@bot.event
async def on_ready():
    await bot.change_presence(activity=discord.Activity(name = ">help", type=discord.ActivityType.listening))
    print("Logged in as {}".format(bot.user.name))
    print("Discord Version: {}".format(discord.__version__))


@bot.event
async def on_voice_state_update(member, before, after):
    await ddc.on_voice_state_update(member, before, after)

@bot.event
async def on_member_update(before, after):
    #TODO: since we call 2 here should this not actually be an await?
    await asyncio.gather(
        ddc.on_member_update(before, after),
        grouping.on_member_update(before, after)
    )

@bot.command(name='ping')
async def ping(ctx):
    await ctx.send("""```pong\n```""")

try:
    bot.run(config.token)
except KeyboardInterrupt:
    print("Closing bot due to keyboard interrupt")
except Exception as e:
    print(e)

