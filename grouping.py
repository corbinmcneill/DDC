import asyncio
import config
import discord
import logging
import random

group_addition_reason = "grouping role addition"
group_removal_reason = "grouping role removal"
group_delete_reason = "grouping deletes empty roles"
group_create_reason = "grouping creates roles when necessary"

role_colors = [discord.Color.teal(),
               discord.Color.dark_teal(),
               discord.Color.green(),
               discord.Color.dark_green(),
               discord.Color.blue(),
               discord.Color.dark_blue(),
               discord.Color.purple(),
               discord.Color.dark_purple(),
               discord.Color.magenta(),
               discord.Color.dark_magenta(),
               discord.Color.gold(),
               discord.Color.dark_gold(),
               discord.Color.orange(),
               discord.Color.dark_orange(),
               discord.Color.red(),
               discord.Color.dark_red(),
               discord.Color.blurple(),
               discord.Color.greyple()]

async def check_for_role_deletions(guild):
    roles = await guild.fetch_roles()
    for r in roles:
        if len(r.members) == 0:
            await r.delete(reason=group_delete_reason)


async def remove_member_from_relevant_group(member, old_activity_name):
    if not member or not old_activity_name:
        return

    relevant_role = discord.utils.find(lambda r: r.name == old_activity_name, member.roles)
    if relevant_role:
        await member.remove_roles(relevant_role, reason=group_removal_reason)
        await check_for_role_deletions(member.guild)


async def add_member_to_relevant_group(member, new_activity_name):
    if not member or not new_activity_name:
        return

    relevant_role = discord.utils.find(lambda r: r.name == new_activity_name, member.guild.roles)
    if not relevant_role:
        role_color = random.choice(role_colors)
        relevant_role = await member.guild.create_role(name=new_activity_name, color=role_color, hoist=True)
    await member.add_roles(relevant_role, reason=group_addition_reason)

async def on_member_update(before, after):
    before_activity_name = None
    after_activity_name = None

    if before.activity:
        before_activity_name = before.activity.name
    if after.activity:
        after_activity_name = after.activity.name

    if before_activity_name != after_activity_name:
        if before_activity_name:
            await remove_member_from_relevant_group(before, before_activity_name)
        if after_activity_name:
            await add_member_to_relevant_group(after, after_activity_name)

