<?php
namespace Entities;

use Database\DatabaseManager;
use Database\Entities\Condition;

use Log\Logger;
use Log\LogChannels;

define('TABLE_ASSIGNMENTS', 'assignments');
define('TABLE_ASSIGNMENT_TARGETS', 'assignment_targets');

class Assignment extends Entity {
    protected /* int */ $id;
    protected /* int */ $test_id;
    protected /* int */ $attempt_limit;
    protected /* int[][] */ $targets;
    protected /* DateTime */ $time_limit;
    protected /* DateTime */ $assignment_date;
    protected /* string */ $assigning_user_id;

    const TARGET_TYPE_USER = 0;
    const TARGET_TYPE_GROUP = 1;
    const TARGET_TYPE_LINK = 2;

    protected static /* string */ function GetTableName(){
        return TABLE_ASSIGNMENTS;
    }

    protected static /* bool */ function AllowsDeferredFetch(){
        return true;
    }

    protected /* void */ function OnPopulate(){
        settype($this->id, 'int');
        settype($this->test_id, 'int');
        settype($this->attempt_limit, 'int');

        $this->assignment_date = \DateTime::createFromFormat('Y-m-d H:i:s', $this->assignment_date);
        $this->time_limit = \DateTime::createFromFormat('Y-m-d H:i:s', $this->time_limit);
    }

    protected /* void */ function ProcessTargets(){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Select()
                ->Where('assignment_id', '=', $this->GetId())
                ->Run();
        
        $this->targets = [];
        for($i=0; $i < $result->num_rows; $i++){
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

    public /* User */ function GetAssigningUser(){
        $this->FetchIfNeeded();
        return new \Entities\User($this->assigning_user_id);
    }

    public /* bool */ function HasTimeLimitExceeded(){
        return $this->GetTimeLimit() < (new \DateTime());
    }

    public /* bool */ function AreRemainingAttempts(\Auth\Users\User $user){
        return ($this->AreAttemptsUnlimited() || $this->CountUserAttempts($user) < $this->GetAttemptLimit($user)) && !$this->GetTest()->IsDeleted();
    }

    public /* int */ function GetAverageScore(\Auth\Users\User $user){
        $attempts = $this->GetUserAttempts($user);
        $test = $this->GetTest();

        if($test->GetScoreCounting() == Test::SCORE_BEST){
            $best_score = -1;
            foreach ($attempts as $attempt) {
                $got = $attempt->GetScore();
                $max = $attempt->GetMaxScore();

                if($got > $max) continue;
                if($max == 0) continue;

                $score = $got / $max;
                if($score > $best_score) $best_score = $score;
            }

            if($best_score == -1) return null;
            return round(100 * $best_score);
        }else{
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
    }

    public /* (User|Group)[] */ function GetTargets(){
        if(!isset($this->targets)) $this->ProcessTargets();

        $targets = [];
        foreach($this->targets as $target){
            switch(intval($target[1])){
                case self::TARGET_TYPE_USER:
                    $targets[] = new \Entities\User($target[0]);
                break;
                case self::TARGET_TYPE_GROUP:
                    $targets[] = new \Entities\Group($target[0]);
                break;
                case self::TARGET_TYPE_LINK:
                    $targets[] = $target[0];
                break;
            }
        }
        return $targets;
    }

    public function GetLink(){
        if(!isset($this->targets)) $this->ProcessTargets();

        foreach ($this->targets as $target) {
            if($target[1] == self::TARGET_TYPE_LINK) return $target[0];
        }

        return null;
    }

    public /* bool */ function IsForUser(\Auth\Users\User $user){
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

    public static /* Assignment[] */ function GetForTest(Test $test){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENTS)
                ->Select()
                ->Where('test_id', '=', $test->GetId())
                ->Run();

        if($result === false) throw new \Exception('Nie udało się odczytać przypisań dla testu.');

        $assignments = [];
        for($i = 0; $i < $result->num_rows; $i++){
            $assignments[] = new Assignment($result->fetch_assoc());
        }
        return $assignments;
    }

    public static /* int */ function CountForTest(Test $test){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENTS)
                ->Select(['id'])
                ->Where('test_id', '=', $test->GetId())
                ->Run();

        if($result === false) throw new \Exception('Nie udało się policzyć, ile razy test został przypisany.');
        return $result->num_rows;
    }

    public /* Attempt[] */ function GetUserAttempts(\Auth\Users\User $user, bool $include_unfinished = false){
        return Attempt::GetAttemptsByUserAndAssignment($user, $this, $include_unfinished);
    }

    public /* int */ function CountUserAttempts(\Auth\Users\User $user){
        return Attempt::CountAttemptsByUserAndAssignment($user, $this);
    }

    public /* ?Attempt */ function GetUsersLastAttempt(\Auth\Users\User $user){
        return Attempt::GetLastAttemptByUserAndAssignment($user, $this);
    }

    public /* void */ function AddTarget($target_type, $target_id){
        if($target_type == self::TARGET_TYPE_LINK){
            $target_id = self::GenerateLinkId();
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Insert()
                ->Value('assignment_id', $this->GetId())
                ->Value('target_type', $target_type)
                ->Value('target_id', $target_id)
                ->Run();
        
        if(!$result) throw new \Exception('Nie udało się przypisać testu użytkownikowi lub grupie.');
    }

    public /* void */ function RemoveTarget($target_type, $target_id){
        if($target_type == self::TARGET_TYPE_LINK){
            $target_id = $this->GetLink();
        }

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Delete()
                ->Where('assignment_id', '=', $this->GetId())
                ->AndWhere('target_type', '=', $target_type)
                ->AndWhere('target_id', '=', $target_id)
                ->Run();
        
        if(!$result) throw new \Exception('Nie udało się usunąć testu użytkownikowi lub grupie.');
    }

    public function Update(int $attempt_limit, \DateTime $deadline){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENTS)
                ->Update()
                ->Set('attempt_limit', $attempt_limit)
                ->Set('time_limit', $deadline->format('Y-m-d H:i:s'))
                ->Where('id', '=', $this->id)
                ->Run();
        
        if(!$result) throw new \Exception('Nie udało się zaktualizować testu.');
    }

    public static /* Assignment */ function Create(\Auth\Users\User $assigning_user, Test $test, int $attempt_limit, \DateTime $time_limit){
        $db = DatabaseManager::GetProvider();

        $result = $db->Table(TABLE_ASSIGNMENTS)
                ->Insert()
                ->Value('assigning_user_id', $assigning_user->GetId())
                ->Value('test_id', $test->GetId())
                ->Value('attempt_limit', $attempt_limit)
                ->Value('time_limit', $time_limit->format('Y-m-d H:i:s'))
                ->Value('assignment_date', (new \DateTime())->format('Y-m-d H:i:s'))
                ->Run();

        if(!$result){
            Logger::Log('Nie udało się przypisać testu: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się przypisać testu');
        }

        $result = $db->Table(TABLE_ASSIGNMENTS)
                ->Select(['id'])
                ->OrderBy('id', 'DESC')
                ->Run();

        if($result === false || $result->num_rows == 0){
            Logger::Log('Nie udało się przypisać testu: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się przypisać testu');
        }
        $row = $result->fetch_assoc();
        $assignment_id = $row['id'];
        return new Assignment($assignment_id);
    }

    public static /* Assignment[] */ function GetAssignmentsForUser(\Auth\Users\User $user){
        $groups = $user->GetGroups();

        $master_cond = new Condition('OR');

        $user_cond = new Condition('AND');
        $user_cond->Add('target_id = "'.$user->GetId().'"');
        $user_cond->Add('target_type = '.self::TARGET_TYPE_USER);
        $master_cond->Add($user_cond);

        foreach($groups as $group){
            $group_cond = new Condition('AND');
            $group_cond->Add('target_id = "'.$group->GetId().'"');
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
        for($i=0; $i < $result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $id = $row['assignment_id'];
            if(isset($assignment_ids[$id])) continue;
            $assignment_ids[$id] = true;
            $assignments[] = new Assignment($id);
        }

        return $assignments;
    }

    public static /* Assignment[] */ function GetAssignedByUser(\Auth\Users\User $user){
        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENTS)
                ->Select()
                ->Where('assigning_user_id', '=', $user->GetId())
                ->OrderBy('id', 'DESC')
                ->Run();
        
        $assignments = [];
        for($i=0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $id = $row['id'];
            $assignments[] = new Assignment($id);
        }

        return $assignments;
    }

    protected static function GenerateLinkId(){
        $is_unique = false;
        $link_id = 0;

        while(!$is_unique){
            // Wylosuj identyfikator - ciąg 8 losowych liter
            $link_id = \Utils\StringUtils::RandomString(8);

            $result = DatabaseManager::GetProvider()
                    ->Table(TABLE_ASSIGNMENT_TARGETS)
                    ->Select()
                    ->Where('target_type', '=', self::TARGET_TYPE_LINK)
                    ->AndWhere('target_id', '=', $link_id)
                    ->Run();

            $is_unique = $result->num_rows == 0;
        }

        return $link_id;
    }

    public static /* Assignment[] */ function GetLinkAssignments(){
        $assignments = [];

        $result = DatabaseManager::GetProvider()
                ->Table(TABLE_ASSIGNMENT_TARGETS)
                ->Select()
                ->Where('target_type', '=', self::TARGET_TYPE_LINK)
                ->Run();
        
        if($result === false){
            Logger::Log('Nie udało się pobrać przypisań dostępnych po linku: '.DatabaseManager::GetProvider()->GetError(), LogChannels::DATABASE);
            throw new \Exception('Nie udało się pobrać przypsań dostępnych po linku');
        }

        for($i = 0; $i < $result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $assignments[] = new Assignment($row['assignment_id']);
        }

        return $assignments;
    }
}
?>