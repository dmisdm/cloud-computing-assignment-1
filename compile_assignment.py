from git import Repo
import os
import datetime

repo = Repo(os.path.dirname(__file__))
ignored_paths = [
    "Assignment3Proposal.md",
    ".vscode/",
    "api/bigquery.py",
    "web/public/favicon",
    "web/yarn.lock",
]

task_2_code = open("api/bigquery.py").read()
assignment_3_proposal_text = open("Assignment3Proposal.md", "r").read()
task_1_text = ""
for item in repo.tree().traverse():
    if (
        item.type == "blob"
        and len(
            list(filter(lambda path: item.path.startswith(path), ignored_paths))
        )
        == 0
    ):
        item_content = open(item.path, "r").read()
        task_1_text += f"""
#--- {item.path} ---#
{item_content}

        """
output_file = open("s3429288.txt", "w")
output_file.write(
    f"""
Name: Daniel Manning
Student ID: s3429288
Date: {datetime.date.today()}
Repo: https://github.com/dmisdm/cloud-computing-assignment-1
Tagged Submission: https://github.com/dmisdm/cloud-computing-assignment-1/tree/submition
Deployed Site: https://neon-trilogy-307702.ts.r.appspot.com/
Deployed BigQueries Page: https://neon-trilogy-307702.ts.r.appspot.com/big-queries

Notes:
If you like, you can view the code in the git repository using the tagged commit link above.
The file is separated into the 3 sections, delimited by "#--- Begin Task X ---#" and "#--- End Task X ---#".



#--- Begin Task 1 ---#
{task_1_text}
#--- End Task 1 ---#


#--- Begin Task 2 ---#
{task_2_code}
#--- End Task 2 ---#

#--- Begin Task 3 ---#
{assignment_3_proposal_text}
#--- End Task 3 ---#          

                  """
)
