<?php
namespace Entities;

use \UEngine\Modules\Core\RichException;
use \UEngine\Modules\Core\Database\DatabaseManager;
use \UEngine\Modules\Database\Entities\Condition;

define('TABLE_ASSIGNMENTS', 'assignments');
define('TABLE_ASSIGNMENT_TARGETS', 'assignment_targets');

class Assignment extends Entity {
    protected /* int */ $id;
    protected /* int */ $test_id;
    protected /* int */ $attempt_limit;
    protected /* int[][] */ $targets;
    protected /* DateTime */ $time_limit;
    protected /* DateTime */ $assignment_date;

    const TARGET_TYPE_USER = 0;
    const TARGET_TYPE_GROUP = 1;

    protected static /* string */ function GetTableName(){
        return TABLE_ASSIGNMENTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->test_id, 'int');

        $this->assignment_date = \DateTime::createFromFormat('Y-m-d H:i:s', $this->assignment_date);
        $this->time_limit = \DateTime::createFromFormat('Y-m-d H:i:s', $this->time_limit);
    }

    protected /* void */ function ProcessTargets(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Select()
                ->Where('assignment_id', '=', $this->GetId())
                ->Run();
        
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $this->targets[] = [$row['target_id'], $row['target_type']];
        }
    }

    public /* int */ function GetId(){
        $this->FetchIfNeeded($this->id);
        return $this->id;
    }

    public /* Test */ function GetTest(){
        $this->FetchIfNeeded();
        return new Test($this->test_id);
    }

    public /* int */ function GetAttemptLimit(){
        $this->FetchIfNeeded();
        return $this->attempt_limit;
    }

    public /* bool */ function AreAttemptsUnlimited(){
        return ($this->GetAttemptLimit() == 0);
    }

    public /* DateTime */ function GetTimeLimit(){
        $this->FetchIfNeeded();
        return $this->time_limit;
    }

    public /* DateTime */ function GetAssignmentDate(){
        $this->FetchIfNeeded();
        return $this->assignment_date;
    }

    public /* bool */ function HasTimeLimitExceeded(){
        return $this->GetTimeLimit() < (new \DateTime());
    }

    public /* bool */ function AreRemainingAttempts(User $user){
        return $this->AreAttemptsUnlimited() || $this->CountUserAttempts($user) < $this->GetAttemptLimit($user);
    }

    public /* int */ function GetAverageScore(User $user){
        $attempts = $this->GetUserAttempts($user);
        $score_got = 0;
        $score_max = 0;
        foreach($attempts as $attempt){
            $got = $attempt->GetScore();
            $max = $attempt->GetMaxScore();

            if($got > $max) continue;

            $score_got += $got;
            $score_max += $max;
        }

        if($score_max == 0) return null;
        return round(100 * ($score_got / $score_max));
    }

    public /* (User|Group)[] */ function GetTargets(){
        if(!isset($this->targets)) $this->ProcessTargets();

        $targets = [];
        foreach($this->targets as $target){
            switch($target[1]){
                case self::TARGET_TYPE_USER:
                    $targets[] = new User($row['target_id']);
                break;
                case self::TARGET_TYPE_GROUP:
                    $targets[] = new Group($row['target_id']);
                break;
            }
        }
        return $targets;
    }

    public /* bool */ function IsForUser(User $user){
        if(!isset($this->targets)) $this->ProcessTargets();

        $groups = $user->GetGroups();
        foreach($this->targets as $target){
            switch($target[1]){
                case self::TARGET_TYPE_USER:
                    if($target[0] == $user->GetId()) return true;
                break;
                case self::TARGET_TYPE_GROUP:
                    foreach($groups as $group){
                        if($group->GetId() == $target[0]) return true;
                    }
                break;
            }
        }

        return false;
    }

    public /* Attempt[] */ function GetUserAttempts(User $user){
        return Attempt::GetAttemptsByUserAndAssignment($user, $this);
    }

    public /* int */ function CountUserAttempts(User $user){
        return Attempt::CountAttemptsByUserAndAssignment($user, $this);
    }

    public static /* Assignment */ function GetAssignmentsForUser(User $user){
        $groups = $user->GetGroups();

        $master_cond = new Condition('OR');

        $user_cond = new Condition();
        $user_cond->Add('target_id = '.$user->GetId());
        $user_cond->Add('target_type = '.self::TARGET_TYPE_USER);
        $master_cond->Add($user_cond);

        foreach($groups as $group){
            $group_cond = new Condition();
            $group_cond->Add('target_id = '.$group->GetId());
            $group_cond->Add('target_type = '.self::TARGET_TYPE_GROUP);
            $master_cond->Add($group_cond);
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Select()
                ->OrderBy('id', 'DESC')
                ->WhereCondition($master_cond)
                ->Run();
        
        $assignments = [];
        $assignment_ids = [];
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $id = $row['assignment_id'];
            if(isset($assignment_ids[$id])) continue;
            $assignment_ids[$id] = true;
            $assignments[] = new Assignment($id);
        }

        return $assignments;
    }
}
?>